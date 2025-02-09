import { CONTRIBUTORS } from "./types/contributors";
import { ethers, getAddress, solidityPacked } from "ethers";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";

export const getMerkleRoot = (contributorsData: CONTRIBUTORS[]) => {
  const merkleTree = generateMerkleTree(contributorsData);
  return merkleTree.getRoot().toString("hex");
};

export const generateProofOfALeaf = async (address: string, amount: number, contributorsData: CONTRIBUTORS[]) => {
  console.log(address, "address");
  const merkleTree = await generateMerkleTree(contributorsData);
  const leaf = getLeaf(address, amount);
  return merkleTree.getHexProof(leaf);
};

const generateMerkleTree = (contributorsData: CONTRIBUTORS[]) => {
  console.log(contributorsData, "contributorsData in generateMerkleTree");
  const leaves = contributorsData.map(({ address, amount }) => getLeaf(address, amount));
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return merkleTree;
};

const getLeaf = (address: string, amount: number) => {
  console.log("Received address:", address, "amount:", amount);

  if (!address || typeof address !== "string") {
    throw new Error(`Address is empty or invalid: ${address}`);
  }

  try {
    const validAddress = getAddress(address.trim()); // Ensure valid checksum address
    return keccak256(solidityPacked(["address", "uint256"], [validAddress, amount]));
  } catch (error) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }
};
