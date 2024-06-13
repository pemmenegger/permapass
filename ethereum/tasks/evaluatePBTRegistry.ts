import { task } from "hardhat/config";
import { Evaluation } from "../types";
import { evaluateFunction } from "../helpers/evaluation/evaluateFunction";
import { evaluateDeployment } from "../helpers/evaluation/evaluateDeployment";
import { evaluateContract } from "../helpers/evaluation/evaluateContract";
import { writeEvaluation } from "../helpers/evaluation/writeEvaluation";
import { getLogger } from "../helpers/evaluation/getLogger";
import { getDummyData } from "../helpers/evaluation/getDummyData";
import { Address } from "viem";

/**
 Example:
 npx hardhat evaluatePBTRegistry \
   --network localhost
 */
task("evaluatePBTRegistry", "Evaluates the PBT Registry contract")
  .addParam<Address>("from", "The address to send from")
  .setAction(async (taskArgs, hre) => {
    const contractName = "PBTRegistry";

    const logger = getLogger(hre, contractName);
    const publicClient = await hre.viem.getPublicClient();
    const walletClient = await hre.viem.getWalletClient(taskArgs.from);

    const evaluation: Evaluation = {
      deployment: [],
      create: [],
      read: [],
      update: [],
      delete: [],
    };

    const contractAddress = await evaluateDeployment(hre, contractName, taskArgs.from, evaluation);
    const contract = await hre.viem.getContractAt(contractName, contractAddress, { client: { wallet: walletClient } });

    // Preparation: Get HaLo NFC chip properties
    const dummyData = await getDummyData(hre);

    const crudFunctions = {
      create: async () => {
        const { response: txReceipt, performance: mintPerformance } = await evaluateFunction(async () => {
          const txHash = await contract.write.mintPBT([
            dummyData.chipAddress,
            dummyData.signatureFromChip,
            dummyData.blockNumberUsedInSig,
            dummyData.passportDataURI,
          ]);
          return await publicClient.waitForTransactionReceipt({ hash: txHash });
        });

        evaluation.create.push({
          functionName: "mintPBT",
          gasUsedInWei: Number(txReceipt.gasUsed),
          ...mintPerformance,
        });
      },
      read: async () => {
        const { response: tokenURI, performance } = await evaluateFunction(async () => {
          return await contract.read.tokenURI([BigInt(1)]);
        });

        logger.info(`read ${tokenURI}`);

        evaluation.read.push({
          functionName: "tokenURI",
          gasUsedInWei: 0,
          ...performance,
        });
      },
      update: async () => {
        const { response: txReceipt, performance: setTokenPerformance } = await evaluateFunction(async () => {
          const txHash = await contract.write.setTokenURI([BigInt(1), dummyData.passportDataURI]);
          return await publicClient.waitForTransactionReceipt({ hash: txHash });
        });

        evaluation.update.push({
          functionName: "setTokenURI",
          gasUsedInWei: Number(txReceipt.gasUsed),
          ...setTokenPerformance,
        });
      },
      delete: async () => {
        const { response: txReceipt, performance } = await evaluateFunction(async () => {
          const txHash = await contract.write.burn([BigInt(1)]);
          return await publicClient.waitForTransactionReceipt({ hash: txHash });
        });

        evaluation.delete.push({
          functionName: "burn",
          gasUsedInWei: Number(txReceipt.gasUsed),
          ...performance,
        });
      },
    };

    await evaluateContract(hre, contractName, crudFunctions);
    await writeEvaluation(hre, contractName, evaluation);
  });
