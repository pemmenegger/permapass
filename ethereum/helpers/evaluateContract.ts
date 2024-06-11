import hre from "hardhat";
import { evaluateTransaction } from "../helpers/evaluateTransaction";
import { exportEvaluation } from "../helpers/exportEvaluation";
import { Evaluation } from "../types";
import { Abi, Address, Hex, PublicClient } from "viem";

interface WriteResponse {
  txHash: Hex;
  functionName: string;
}

interface ReadResponse {
  functionName: string;
}

export interface ContractConfig {
  contractName: string;
  abi: Abi;
  bytecode: Hex;
  functions: {
    create: Array<(contractAddress: Address, walletAddress: Address) => Promise<WriteResponse>>;
    read: (contractAddress: Address, publicClient: PublicClient) => Promise<ReadResponse>;
    update: (contractAddress: Address) => Promise<WriteResponse>;
    delete: (contractAddress: Address) => Promise<WriteResponse>;
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
      });

      return { txReceipt, functionName: "deployContract" };
    });

    if (!txReceipt || !txReceipt.contractAddress) {
      throw new Error("Deployment failed: Transaction receipt missing or contract address not found.");
    }

    contractAddress = txReceipt.contractAddress;
    evaluation.deployment = [
      {
        gasUsedInWei: Number(txReceipt.gasUsed),
        ...performance,
      },
    ];
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
    evaluation.create = [];

    for (const createFunc of contractConfig.functions.create) {
      const { txReceipt, performance } = await evaluateTransaction(async () => {
        const { txHash, functionName } = await createFunc(contractAddress, walletClient.account.address);
        const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        return { txReceipt, functionName };
      });

      if (!txReceipt) {
        throw new Error("Creation failed: Transaction receipt is missing.");
      }

      evaluation.create.push({
        gasUsedInWei: Number(txReceipt.gasUsed),
        ...performance,
      });
    }

    logInfo(`Successful`);
  } catch (e) {
    logError(`Creation evaluation error: ${e}`);
    throw e;
  }

  try {
    logInfo("Evaluate Read...");
    const { performance } = await evaluateTransaction(async () => {
      const { functionName } = await contractConfig.functions.read(contractAddress, publicClient);
      return { functionName };
    });

    evaluation.read = [
      {
        gasUsedInWei: 0,
        ...performance,
      },
    ];
    logInfo(`Successful`);
  } catch (e) {
    logError(`Read evaluation error: ${e}`);
    throw e;
  }

  try {
    logInfo("Evaluate Update...");
    const { txReceipt, performance } = await evaluateTransaction(async () => {
      const { txHash, functionName } = await contractConfig.functions.update(contractAddress);
      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      return { txReceipt, functionName };
    });

    if (!txReceipt) {
      throw new Error("Update failed: Transaction receipt is missing.");
    }

    evaluation.update = [
      {
        gasUsedInWei: Number(txReceipt.gasUsed),
        ...performance,
      },
    ];
    logInfo(`Successful`);
  } catch (e) {
    logError(`Update evaluation error: ${e}`);
    throw e;
  }

  try {
    logInfo("Evaluate Delete...");
    const { txReceipt, performance } = await evaluateTransaction(async () => {
      const { txHash, functionName } = await contractConfig.functions.delete(contractAddress);
      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      return { txReceipt, functionName };
    });

    if (!txReceipt) {
      throw new Error("Deletion failed: Transaction receipt is missing.");
    }

    evaluation.delete = [
      {
        gasUsedInWei: Number(txReceipt.gasUsed),
        ...performance,
      },
    ];
    logInfo(`Successful`);
  } catch (e) {
    logError(`Delete evaluation error: ${e}`);
    throw e;
  }

  logInfo(`Exporting evaluation results...`);
  exportEvaluation({ contractName: contractConfig.contractName, evaluation });
  logInfo(`Successful`);
};
