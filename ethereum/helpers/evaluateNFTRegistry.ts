import { evaluateContract } from "../helpers/evaluateContract";
import { Address } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const evaluateNFTRegistry = async ({
  hre,
  testPassportDataURI,
  testUpdatedPassportDataURI,
}: {
  hre: HardhatRuntimeEnvironment;
  testPassportDataURI: string;
  testUpdatedPassportDataURI: string;
}) => {
  const NFTRegistryArtifact = await hre.artifacts.readArtifact("NFTRegistry");

  await evaluateContract({
    contractName: "NFTRegistry",
    abi: NFTRegistryArtifact.abi,
    bytecode: NFTRegistryArtifact.bytecode,
    functions: {
      create: [
        async (contractAddress: Address, walletAddress: Address) => {
          const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress);
          const txHash = await contract.write.mintNFT([walletAddress, testPassportDataURI]);
          return {
            txHash,
            functionName: "mintNFT",
          };
        },
      ],
      read: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress);
        const tokenURI = await contract.read.tokenURI([BigInt(1)]);
        console.log(`NFTRegistry read ${tokenURI}`);
        return {
          functionName: "tokenURI",
        };
      },
      update: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress);
        const txHash = await contract.write.setTokenURI([BigInt(1), testUpdatedPassportDataURI]);
        return {
          txHash,
          functionName: "setTokenURI",
        };
      },
      delete: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress);
        const txHash = await contract.write.burn([BigInt(1)]);
        return {
          txHash,
          functionName: "burn",
        };
      },
    },
  });
};
