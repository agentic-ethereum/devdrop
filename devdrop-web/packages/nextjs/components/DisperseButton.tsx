"use client";

import React from "react";
import { contributorsData } from "~~/utils/contractsDeploy/constants";
import { deployContract } from "~~/utils/contractsDeploy/deploy";

const DisperseButton = () => {
  return (
    <div className="flex items-center justify-center">
      <button onClick={async () => await deployContract(contributorsData)} className="btn btn-primary mt-4">
        Disperse Airdrop
      </button>
    </div>
  );
};

export default DisperseButton;
