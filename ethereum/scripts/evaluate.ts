import hre from "hardhat";
import { evaluateContract } from "../helpers/evaluateContract";
import { Address } from "viem";

/*
 * Run this script using the following command:
 * npx hardhat run scripts/evaluate.ts --network <network>
 */
async function main() {
  console.log("Compiling contracts...");
  await hre.run("compile");

  const NFTRegistryArtifact = await hre.artifacts.readArtifact("NFTRegistry");
  await evaluateContract({
    contractName: "NFTRegistry",
    abi: NFTRegistryArtifact.abi,
    bytecode: NFTRegistryArtifact.bytecode,
    functions: {
      create: async (contractAddress: Address, walletAddress: Address) => {
        const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress);
        const txHash = await contract.write.mintNFT([
          walletAddress,
          "ar://rgiLrvb-FXtlcbrA5LP-b-ytIkUXXNnk19X-oEhprAs",
        ]);
        return txHash;
      },
      read: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress);
        const tokenURI = await contract.read.tokenURI([BigInt(1)]);
        console.log(`NFTRegistry read ${tokenURI}`);
      },
      update: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress);
        const txHash = await contract.write.setTokenURI([
          BigInt(1),
          "ar://rgiLrvb-FXtlcbrA5LP-b-ytIkUXXNnk19X-ABCDEFG",
        ]);
        return txHash;
      },
      delete: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress);
        const txHash = await contract.write.burn([BigInt(1)]);
        return txHash;
      },
    },
  });

  //   const PBTRegistryArtifact = await hre.artifacts.readArtifact("PBTRegistry");
  //   await evaluateContract({
  //     contractName: "PBTRegistry",
  //     abi: PBTRegistryArtifact.abi,
  //     bytecode: PBTRegistryArtifact.bytecode,
  //     functions: {
  //       create: async () => {
  //         return "0x";
  //       },
  //       read: async () => {
  //         return;
  //       },
  //       update: async () => {
  //         return "0x";
  //       },
  //       delete: async () => {
  //         return "0x";
  //       },
  //     },
  //   });

  //   const DIDRegistryArtifact = await hre.artifacts.readArtifact("DIDRegistry");
  //   await evaluateContract({
  //     contractName: "DIDRegistry",
  //     abi: DIDRegistryArtifact.abi,
  //     bytecode: DIDRegistryArtifact.bytecode,
  //     functions: {
  //       create: async () => {
  //         return "0x";
  //       },
  //       read: async () => {
  //         return;
  //       },
  //       update: async () => {
  //         return "0x";
  //       },
  //       delete: async () => {
  //         return "0x";
  //       },
  //     },
  //   });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
