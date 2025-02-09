"use client";

import React, { useEffect, useState } from "react";
import { useWriteDevDropTokenClaimClaimToken } from "~~/hooks/wagmi/contracts";
import getAddress from "~~/lib/prismaAddress";
import { contributorsData } from "~~/utils/contractsDeploy/constants";
import { generateProofOfALeaf } from "~~/utils/contractsDeploy/merkle";

type ClaimButtonProps = {
  id: number;
};

const ClaimButton = ({ id }: ClaimButtonProps) => {
  const { writeContract } = useWriteDevDropTokenClaimClaimToken();
  const [addressDetails, setAddressDetails] = useState(null);
  const [merkleProof, setMerkleProof] = useState(null);

  useEffect(() => {
    const fetchAddressDetails = async () => {
      const details = await getAddress(id);
      setAddressDetails(details);
      console.log(details, "addressDetails");
    };

    fetchAddressDetails();
  }, [id]);

  useEffect(() => {
    if (addressDetails) {
      const proof = generateProofOfALeaf("", 100, contributorsData);
      setMerkleProof(proof);
      console.log(proof, "merkleProof");
    }
  }, [addressDetails]);

  const handleClaimToken = () => {
    if (merkleProof) {
      writeContract({
        address: "", 
        args: [merkleProof, BigInt(100)],
      });
    }
  };

  return (
    <div>
      <button onClick={handleClaimToken} className="btn btn-primary mt-4" disabled={!merkleProof}>
        Claim Token
      </button>
    </div>
  );
};

export default ClaimButton;
