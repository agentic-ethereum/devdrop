"use client";

import React, { useEffect, useState } from "react";
import { tokenAddress } from "@prisma/client";
import { useWriteDevDropTokenClaimClaimToken } from "~~/hooks/wagmi/contracts";
import getAddress from "~~/lib/prismaAddress";
import { contributorsData } from "~~/utils/contractsDeploy/constants";
import { generateProofOfALeaf } from "~~/utils/contractsDeploy/merkle";

export type Id = {
  id: string;
};

type ClaimButtonProps = {
  id: Id;
};

const ClaimButton = ({ id }: ClaimButtonProps) => {
  console.log(id, "id");
  const { writeContract } = useWriteDevDropTokenClaimClaimToken();
  const [addressDetails, setAddressDetails] = useState<tokenAddress | null>(null);
  const [merkleProof, setMerkleProof] = useState<string[] | "">([]);

  useEffect(() => {
    const fetchAddressDetails = async () => {
      const details = await getAddress(id?.id);
      setAddressDetails(details);
      console.log(details, "addressDetails");
    };

    fetchAddressDetails();
  }, [id]);

  useEffect(() => {
    const fetchMerkleProof = async () => {
      if (addressDetails) {
        try {
          const proof = await generateProofOfALeaf(process.env.NEXT_PUBLIC_USER_ONE || "", 100, contributorsData);
          setMerkleProof(proof);
          console.log(proof, "merkleProof");
        } catch (error) {
          console.error("Error generating Merkle proof:", error);
        }
      }
    };

    fetchMerkleProof();
  }, [addressDetails]);

  const handleClaimToken = () => {
    if (merkleProof) {
      writeContract({
        address: addressDetails?.tokenClaimAddress || "",
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
