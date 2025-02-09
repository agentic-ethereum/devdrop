import { CONTRIBUTORS } from "./types/contributors";
import { ethers } from "ethers";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";

export const getMerkleRoot = (contributorsData: CONTRIBUTORS[]) => {
  const merkleTree = generateMerkleTree(contributorsData);
  return merkleTree.getRoot().toString("hex");
};

export const generateProofOfALeaf = (address: string, amount: number, contributorsData: CONTRIBUTORS[]) => {
  const merkleTree = generateMerkleTree(contributorsData);
  const leaf = getLeaf(address, amount);
  return merkleTree.getHexProof(leaf);
};

const generateMerkleTree = (contributorsData: CONTRIBUTORS[]) => {
  const leaves = contributorsData.map(({ address, amount }) => getLeaf(address, amount));
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return merkleTree;
};

const getLeaf = (address: string, amount: number) =>
  keccak256(ethers.solidityPacked(["address", "uint256"], [address, amount]));
