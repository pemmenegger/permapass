import hre from "hardhat";
import { evaluateTransaction } from "../helpers/evaluateTransaction";
import { exportEvaluation } from "../helpers/exportEvaluation";
import { Evaluation } from "../types";
import { Abi, Address, Hex } from "viem";

export interface ContractConfig {
  contractName: string;
  abi: Abi;
  bytecode: Hex;
  functions: {
    create: (contractAddress: Address, walletAddress: Address) => Promise<Hex>;
    read: (contractAddress: Address) => Promise<void>;
    update: (contractAddress: Address) => Promise<Hex>;
    delete: (contractAddress: Address) => Promise<Hex>;
  };
}

export const evaluateContract = async (contractConfig: ContractConfig) => {
  const publicClient = await hre.viem.getPublicClient();
  const [walletClient] = await hre.viem.getWalletClients();

  const logPrefix = `Evaluating ${contractConfig.contractName} on ${hre.network.name}`;
  const logInfo = (message: string) => {
    console.log(`${logPrefix} - ${message}`);
  };
  const logError = (message: string) => {
    console.error(`${logPrefix} - ${message}`);
  };

  const evaluation: Evaluation = {};
  let contractAddress: Address | undefined;
  try {
    logInfo("Deploying...");
    const { txReceipt, performance } = await evaluateTransaction(async () => {
      const deploymentTxHash = await walletClient.deployContract({
        abi: contractConfig.abi,
        account: walletClient.account,
        bytecode: contractConfig.bytecode,
      });

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: deploymentTxHash,
        confirmations: 1,
      });

      return txReceipt;
    });

    if (!txReceipt || !txReceipt.contractAddress) {
      throw new Error("Deployment failed: Transaction receipt missing or contract address not found.");
    }

    contractAddress = txReceipt.contractAddress;
    evaluation.deployment = {
      gasUsedInWei: Number(txReceipt.gasUsed),
      performance,
    };
    logInfo(`Successful`);
  } catch (e) {
    logError(`Deployment error: ${e}`);
    throw e;
  }

  if (!contractAddress) {
    throw new Error("Deployment failed: Contract address is missing.");
  }

  try {
    logInfo("Evaluate Creation...");
    const { txReceipt, performance } = await evaluateTransaction(async () => {
      const txHash = await contractConfig.functions.create(contractAddress, walletClient.account.address);
      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });
      return txReceipt;
    });

    if (!txReceipt) {
      throw new Error("Creation failed: Transaction receipt is missing.");
    }

    evaluation.create = {
      gasUsedInWei: Number(txReceipt.gasUsed),
      performance,
    };
    logInfo(`Successful`);
  } catch (e) {
    logError(`Creation evaluation error: ${e}`);
    throw e;
  }

  try {
    logInfo("Evaluate Read...");
    const { performance } = await evaluateTransaction(async () => {
      await contractConfig.functions.read(contractAddress);
    });

    evaluation.read = {
      performance,
    };
    logInfo(`Successful`);
  } catch (e) {
    logError(`Read evaluation error: ${e}`);
    throw e;
  }

  try {
    logInfo("Evaluate Update...");
    const { txReceipt, performance } = await evaluateTransaction(async () => {
      const txHash = await contractConfig.functions.update(contractAddress);
      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });
      return txReceipt;
    });

    if (!txReceipt) {
      throw new Error("Update failed: Transaction receipt is missing.");
    }

    evaluation.update = {
      gasUsedInWei: Number(txReceipt.gasUsed),
      performance,
    };
    logInfo(`Successful`);
  } catch (e) {
    logError(`Update evaluation error: ${e}`);
    throw e;
  }

  try {
    logInfo("Evaluate Delete...");
    const { txReceipt, performance } = await evaluateTransaction(async () => {
      const txHash = await contractConfig.functions.delete(contractAddress);
      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });
      return txReceipt;
    });

    if (!txReceipt) {
      throw new Error("Deletion failed: Transaction receipt is missing.");
    }

    evaluation.delete = {
      gasUsedInWei: Number(txReceipt.gasUsed),
      performance,
    };
    logInfo(`Successful`);
  } catch (e) {
    logError(`Delete evaluation error: ${e}`);
    throw e;
  }

  logInfo(`Exporting evaluation results...`);
  exportEvaluation({ contractName: contractConfig.contractName, evaluation });
  logInfo(`Successful`);
};
