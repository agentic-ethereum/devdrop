// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";
import "./tokenMint.sol";

contract DevDropTokenClaim {
    DevDropToken public token;
    bytes32 public merkleRoot;
    bool public isClaimable;

    struct DevDropData {
        uint256 totalReward;
        uint256 claimedTokens;
    }

    mapping(address => DevDropData) public contributorDetails;

    constructor(address tokenAddress, bytes32 _merkleRoot) {
        token = DevDropToken(tokenAddress);
        merkleRoot = _merkleRoot;
    }

    function claimToken(bytes32[] memory proof, uint256 amount) public {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Not Authorized");
        require(amount > 0, "Amount must be greater than zero");

        address to = msg.sender;
        require(to != address(0), "Cannot transfer to the zero address");

        contributorDetails[to].claimedTokens += amount;
        token.mint(to, amount);
    }
}
