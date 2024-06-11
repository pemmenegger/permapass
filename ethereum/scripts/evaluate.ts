import hre from "hardhat";
import { evaluateContract } from "../helpers/evaluateContract";
import { Address, Hex } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const getHaLoNFCChipProperties = async (hre: HardhatRuntimeEnvironment) => {
  const testChipAddress: Address = "0xe448EB028897585F3b17c02F8b91485b2a0FD5f7";
  let testSignatureFromChip: Hex;
  let testBlockNumberUsedInSig: bigint;
  console.log(`Network: ${hre.network.name}`);
  switch (hre.network.name) {
    case "localhost":
      testSignatureFromChip =
        "0x1a8adb44a6725869392ba54289ec26048afc2b20e846a4018ed5f08386ebe18c343ad5fbdfb4f9d2f10df64aa99824267c7f226d18d9e135dd0299e715df10f21b";
      testBlockNumberUsedInSig = 3n;
      break;
    case "sepolia":
      testSignatureFromChip =
        "0x7bde1ac7be3f27db150acc6c533d98f6c6fcd5403aee4796fc6c5d26c66e65d41311db83b4c8453bccfc13b1c9334ad4b2db69aa3e97ba9a13140c6ad77515c91c";
      testBlockNumberUsedInSig = 6085344n;
      break;
    default:
      throw new Error(`Unknown network: ${hre.network.name}`);
  }

  return {
    testChipAddress,
    testSignatureFromChip,
    testBlockNumberUsedInSig,
  };
};

/*
 * Run this script using the following command:
 * npx hardhat run scripts/evaluate.ts --network <network>
 */
async function main() {
  const { testChipAddress, testSignatureFromChip, testBlockNumberUsedInSig } = await getHaLoNFCChipProperties(hre);
  const testTokenURI = "ar://rgiLrvb-FXtlcbrA5LP-b-ytIkUXXNnk19X-oEhprAs";
  const testUpdatedTokenURI = "ar://rgiLrvb-FXtlcbrA5LP-b-ytIkUXXNnk19X-ABCDEFG";

  console.log("Compiling contracts...");
  await hre.run("compile");

  console.log("--- NFTRegistry Evaluation ---");
  const NFTRegistryArtifact = await hre.artifacts.readArtifact("NFTRegistry");
  await evaluateContract({
    contractName: "NFTRegistry",
    abi: NFTRegistryArtifact.abi,
    bytecode: NFTRegistryArtifact.bytecode,
    functions: {
      create: async (contractAddress: Address, walletAddress: Address) => {
        const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress);
        const txHash = await contract.write.mintNFT([walletAddress, testTokenURI]);
        return txHash;
      },
      read: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress);
        const tokenURI = await contract.read.tokenURI([BigInt(1)]);
        console.log(`NFTRegistry read ${tokenURI}`);
      },
      update: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress);
        const txHash = await contract.write.setTokenURI([BigInt(1), testUpdatedTokenURI]);
        return txHash;
      },
      delete: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress);
        const txHash = await contract.write.burn([BigInt(1)]);
        return txHash;
      },
    },
  });

  console.log("--- PBTRegistry Evaluation ---");
  const PBTRegistryArtifact = await hre.artifacts.readArtifact("PBTRegistry");
  await evaluateContract({
    contractName: "PBTRegistry",
    abi: PBTRegistryArtifact.abi,
    bytecode: PBTRegistryArtifact.bytecode,
    functions: {
      create: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("PBTRegistry", contractAddress);
        const txHash = await contract.write.mintPBT([
          testChipAddress,
          testSignatureFromChip,
          testBlockNumberUsedInSig,
          testTokenURI,
        ]);
        return txHash;
      },
      read: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("PBTRegistry", contractAddress);
        const tokenURI = await contract.read.tokenURI([BigInt(1)]);
        console.log(`PBTRegistry read ${tokenURI}`);
      },
      update: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("PBTRegistry", contractAddress);
        const txHash = await contract.write.setTokenURI([BigInt(1), testUpdatedTokenURI]);
        return txHash;
      },
      delete: async (contractAddress: Address) => {
        const contract = await hre.viem.getContractAt("PBTRegistry", contractAddress);
        const txHash = await contract.write.burn([BigInt(1)]);
        return txHash;
      },
    },
  });

  // const DIDRegistryArtifact = await hre.artifacts.readArtifact("DIDRegistry");
  // await evaluateContract({
  //   contractName: "DIDRegistry",
  //   abi: DIDRegistryArtifact.abi,
  //   bytecode: DIDRegistryArtifact.bytecode,
  //   functions: {
  //     create: async () => {
  //       const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress);
  //     const txHash = await contract.write.mintNFT([
  //       walletAddress,
  //       "ar://rgiLrvb-FXtlcbrA5LP-b-ytIkUXXNnk19X-oEhprAs",
  //     ]);
  //     return txHash;
  //     },
  //     read: async () => {
  //       return;
  //     },
  //     update: async () => {
  //       return "0x";
  //     },
  //     delete: async () => {
  //       return "0x";
  //     },
  //   },
  // });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
