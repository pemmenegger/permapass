import hre from "hardhat";
import { evaluateTransaction } from "../helpers/evaluateTransaction";
import { exportEvaluation } from "../helpers/exportEvaluation";
import { Evaluation } from "../types";
import NFTRegistry from "../artifacts/contracts/NFTRegistry.sol/NFTRegistry.json";
import { Address, Hex } from "viem";

/*
 * Run this script using the following command:
 * npx hardhat run scripts/evaluate-NFTRegistry.ts --network <network>
 */
async function main() {
  console.log("Compiling contracts...");
  await hre.run("compile");

  const publicClient = await hre.viem.getPublicClient();
  const [walletClient] = await hre.viem.getWalletClients();

  const contractName = "NFTRegistry";
  const evaluation: Evaluation = {};

  let contractAddress: string | undefined;
  try {
    console.log(`\nDeploying ${contractName}...`);
    const { txReceipt, performance } = await evaluateTransaction(async () => {
      const deploymentTxHash = await walletClient.deployContract({
        abi: NFTRegistry.abi,
        account: walletClient.account,
        bytecode: NFTRegistry.bytecode as Hex,
      });

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: deploymentTxHash,
        confirmations: 1,
      });

      return txReceipt;
    });

    if (!txReceipt || !txReceipt.contractAddress) {
      throw new Error("Deployment failed");
    }

    contractAddress = txReceipt.contractAddress;
    evaluation.deployment = {
      gasUsed: Number(txReceipt.gasUsed),
      performance,
    };
    console.log(`Deployed to ${contractAddress}`);
  } catch (e) {
    console.log(e);
    throw e;
  }

  if (!contractAddress) {
    throw new Error("Contract address is missing");
  }

  // connect contract with default wallet
  const contract = await hre.viem.getContractAt("NFTRegistry", contractAddress as Address);

  // measure gas used and execution time of creation
  try {
    console.log(`\nEvaluate Creation...`);
    const { txReceipt, performance } = await evaluateTransaction(async () => {
      const txHash = await contract.write.mintNFT([
        walletClient.account.address,
        "ar://rgiLrvb-FXtlcbrA5LP-b-ytIkUXXNnk19X-oEhprAs",
      ]);
      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });
      return txReceipt;
    });

    if (!txReceipt) {
      throw new Error("Creation failed");
    }

    evaluation.create = {
      gasUsed: Number(txReceipt.gasUsed),
      performance,
    };
    console.log(`Creation successful`);
  } catch (e) {
    console.log(e);
    throw e;
  }

  // measure execution time of read (tokenURI)
  try {
    console.log(`\nEvaluate Read...`);
    const { performance } = await evaluateTransaction(async () => {
      await contract.read.tokenURI([BigInt(1)]);
    });

    evaluation.read = {
      performance,
    };
    console.log(`Read successful`);
  } catch (e) {
    console.log(e);
    throw e;
  }

  // measure gas and execution time of update (setTokenURI)
  try {
    console.log(`\nEvaluate Update...`);
    const { txReceipt, performance } = await evaluateTransaction(async () => {
      const txHash = await contract.write.setTokenURI([BigInt(1), "ar://rgiLrvb-FXtlcbrA5LP-b-ytIkUXXNnk19X-ABCDEFG"]);
      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });
      return txReceipt;
    });

    if (!txReceipt) {
      throw new Error("Update failed");
    }

    evaluation.update = {
      gasUsed: Number(txReceipt.gasUsed),
      performance,
    };
    console.log(`Update successful`);
  } catch (e) {
    console.log(e);
    throw e;
  }

  // measure gas and execution time of deletion (burn)
  try {
    console.log(`\nEvaluate Delete...`);
    const { txReceipt, performance } = await evaluateTransaction(async () => {
      const txHash = await contract.write.burn([BigInt(1)]);
      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });
      return txReceipt;
    });

    if (!txReceipt) {
      throw new Error("Deletion failed");
    }

    evaluation.delete = {
      gasUsed: Number(txReceipt.gasUsed),
      performance,
    };
    console.log(`Delete successful`);
  } catch (e) {
    console.log(e);
    throw e;
  }

  exportEvaluation({ contractName, evaluation });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
