"use server";

import tokenMintContract from "./artifacts/DevDropToken.json";
import tokenClaimContract from "./artifacts/DevDropTokenClaim.json";
import { CONTRACT } from "./constants";
import { getMerkleRoot } from "./merkle";
import { CONTRIBUTORS } from "./types/contributors";
import { PrismaClient } from "@prisma/client";
import { ethers } from "ethers";

const prisma = new PrismaClient();

export const deployContract = async (contributorsData: CONTRIBUTORS[]) => {
  const provider = new ethers.JsonRpcProvider(CONTRACT.PROVIDED_URL);
  const wallet = new ethers.Wallet(CONTRACT.PRIVATE_KEY, provider);

  // Step 1: Deploy token contract
  const tokenFactory = new ethers.ContractFactory(tokenMintContract.abi, tokenMintContract.bytecode, wallet);
  const tokenContract = await tokenFactory.deploy();
  const tokenContractAddress = await tokenContract.getAddress();
  await tokenContract.waitForDeployment();

  // Step 2: Get merkle root from contributors Data
  const merkleRoot = getMerkleRoot(contributorsData);

  // Step 3: Deploy DevDrops contract with token address and merkle root
  const devDropsFactory = new ethers.ContractFactory(tokenClaimContract.abi, tokenClaimContract.bytecode, wallet);
  const devDropsContract = await devDropsFactory.deploy(tokenContractAddress, `0x${merkleRoot}`);
  const devDropsContractAddress = await devDropsContract.getAddress();

  console.log(`Token contract: ${tokenContractAddress}, DevDrops contract: ${devDropsContractAddress}`);

  const tokenData = await prisma.tokenAddress.create({
    data: {
      tokenAddress: tokenContractAddress,
      tokenClaimAddress: devDropsContractAddress,
    },
  });

  console.log(tokenData, "tokenData");

  return {
    tokenContractAddress,
    devDropsContractAddress,
  };
};
