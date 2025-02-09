import {
  createUseReadContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
  createUseWriteContract,
} from "wagmi/codegen";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DevDrop Token
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const devDropTokenAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "to", internalType: "address", type: "address", indexed: false },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Minted",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DevDrop TokenClaim
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const devDropTokenClaimAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "tokenAddress", internalType: "address", type: "address" },
      { name: "_merkleRoot", internalType: "bytes32", type: "bytes32" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "proof", internalType: "bytes32[]", type: "bytes32[]" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "claimToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "contributorDetails",
    outputs: [
      { name: "totalReward", internalType: "uint256", type: "uint256" },
      { name: "claimedTokens", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "isClaimable",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "merkleRoot",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "contract DevDropToken", type: "address" }],
    stateMutability: "view",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link devDropTokenAbi}__
 */
export const useReadDevDropToken = /*#__PURE__*/ createUseReadContract({
  abi: devDropTokenAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link devDropTokenAbi}__ and `functionName` set to `"balances"`
 */
export const useReadDevDropTokenBalances = /*#__PURE__*/ createUseReadContract({
  abi: devDropTokenAbi,
  functionName: "balances",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link devDropTokenAbi}__
 */
export const useWriteDevDropToken = /*#__PURE__*/ createUseWriteContract({
  abi: devDropTokenAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link devDropTokenAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteDevDropTokenMint = /*#__PURE__*/ createUseWriteContract({
  abi: devDropTokenAbi,
  functionName: "mint",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link devDropTokenAbi}__
 */
export const useSimulateDevDropToken = /*#__PURE__*/ createUseSimulateContract({
  abi: devDropTokenAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link devDropTokenAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateDevDropTokenMint = /*#__PURE__*/ createUseSimulateContract({
  abi: devDropTokenAbi,
  functionName: "mint",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link devDropTokenAbi}__
 */
export const useWatchDevDropTokenEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: devDropTokenAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link devDropTokenAbi}__ and `eventName` set to `"Minted"`
 */
export const useWatchDevDropTokenMintedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: devDropTokenAbi,
  eventName: "Minted",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link devDropTokenClaimAbi}__
 */
export const useReadDevDropTokenClaim = /*#__PURE__*/ createUseReadContract({
  abi: devDropTokenClaimAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link devDropTokenClaimAbi}__ and `functionName` set to `"contributorDetails"`
 */
export const useReadDevDropTokenClaimContributorDetails = /*#__PURE__*/ createUseReadContract({
  abi: devDropTokenClaimAbi,
  functionName: "contributorDetails",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link devDropTokenClaimAbi}__ and `functionName` set to `"isClaimable"`
 */
export const useReadDevDropTokenClaimIsClaimable = /*#__PURE__*/ createUseReadContract({
  abi: devDropTokenClaimAbi,
  functionName: "isClaimable",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link devDropTokenClaimAbi}__ and `functionName` set to `"merkleRoot"`
 */
export const useReadDevDropTokenClaimMerkleRoot = /*#__PURE__*/ createUseReadContract({
  abi: devDropTokenClaimAbi,
  functionName: "merkleRoot",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link devDropTokenClaimAbi}__ and `functionName` set to `"token"`
 */
export const useReadDevDropTokenClaimToken = /*#__PURE__*/ createUseReadContract({
  abi: devDropTokenClaimAbi,
  functionName: "token",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link devDropTokenClaimAbi}__
 */
export const useWriteDevDropTokenClaim = /*#__PURE__*/ createUseWriteContract({
  abi: devDropTokenClaimAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link devDropTokenClaimAbi}__ and `functionName` set to `"claimToken"`
 */
export const useWriteDevDropTokenClaimClaimToken = /*#__PURE__*/ createUseWriteContract({
  abi: devDropTokenClaimAbi,
  functionName: "claimToken",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link devDropTokenClaimAbi}__
 */
export const useSimulateDevDropTokenClaim = /*#__PURE__*/ createUseSimulateContract({ abi: devDropTokenClaimAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link devDropTokenClaimAbi}__ and `functionName` set to `"claimToken"`
 */
export const useSimulateDevDropTokenClaimClaimToken = /*#__PURE__*/ createUseSimulateContract({
  abi: devDropTokenClaimAbi,
  functionName: "claimToken",
});
