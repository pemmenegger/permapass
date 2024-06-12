import { Abi, Address, Hex } from "viem";
import { ContractEvaluation } from "../../types";
import { evaluateFunction } from "./evaluateFunction";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getLogger } from "./getLogger";

export const evaluateDeployment = async (
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  evaluation: ContractEvaluation
) => {
  const logger = getLogger(hre, contractName);
  const publicClient = await hre.viem.getPublicClient();
  const [walletClient] = await hre.viem.getWalletClients();
  const contractArtifact = await hre.artifacts.readArtifact(contractName);

  let contractAddress: Address | null | undefined;

  try {
    logger.info("Deploying...");

    const { response: txReceipt, performance } = await evaluateFunction(async () => {
      const deploymentTxHash = await walletClient.deployContract({
        abi: contractArtifact.abi as Abi,
        account: walletClient.account,
        bytecode: contractArtifact.bytecode as Hex,
      });
      return await publicClient.waitForTransactionReceipt({ hash: deploymentTxHash });
    });

    contractAddress = txReceipt.contractAddress;
    if (!contractAddress) throw new Error("Deployment failed: Contract address is missing.");

    evaluation.deployment.push({
      functionName: "deployContract",
      gasUsedInWei: Number(txReceipt.gasUsed),
      ...performance,
    });

    logger.info(`Deployment successful`);
  } catch (e) {
    logger.error(`Deployment error: ${e}`);
    throw e;
  }

  return contractAddress;
};
