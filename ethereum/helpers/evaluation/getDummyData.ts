import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address, Hex } from "viem";
import { ArweaveURI } from "../../types";

export const getDummyData = async (hre: HardhatRuntimeEnvironment) => {
  const chipAddress: Address = "0xe448EB028897585F3b17c02F8b91485b2a0FD5f7";
  let signatureFromChip: Hex;
  let blockNumberUsedInSig: bigint;

  switch (hre.network.name) {
    case "localhost":
      signatureFromChip =
        "0x1a8adb44a6725869392ba54289ec26048afc2b20e846a4018ed5f08386ebe18c343ad5fbdfb4f9d2f10df64aa99824267c7f226d18d9e135dd0299e715df10f21b";
      blockNumberUsedInSig = 3n;
      break;
    case "sepolia":
      signatureFromChip =
        "0x7bde1ac7be3f27db150acc6c533d98f6c6fcd5403aee4796fc6c5d26c66e65d41311db83b4c8453bccfc13b1c9334ad4b2db69aa3e97ba9a13140c6ad77515c91c";
      blockNumberUsedInSig = 6085344n;
      break;
    default:
      throw new Error(`Unknown network: ${hre.network.name}`);
  }

  return {
    chipAddress,
    signatureFromChip,
    blockNumberUsedInSig,
    passportDataURI: "ar://9oHw2Mm2TenFcQYpEJQzoJrrG--uWO1pDjbJ8d89fB0" as ArweaveURI,
  };
};
