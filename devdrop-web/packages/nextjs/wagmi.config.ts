import DevDropToken from "./utils/contractsDeploy/artifacts/DevDropToken.json";
import DevDropTokenClaim from "./utils/contractsDeploy/artifacts/DevDropTokenClaim.json";
import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { Abi } from "viem";

export default defineConfig({
  out: "hooks/wagmi/contracts.ts",
  contracts: [
    {
      name: "DevDrop Token",
      abi: DevDropToken.abi as Abi,
    },
    {
      name: "DevDrop TokenClaim",
      abi: DevDropTokenClaim.abi as Abi,
    },
  ],
  plugins: [react()],
});
