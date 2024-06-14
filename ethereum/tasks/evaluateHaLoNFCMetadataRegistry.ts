import { task } from "hardhat/config";
import { evaluateFunction } from "../helpers/evaluation/evaluateFunction";
import { evaluateDeployment } from "../helpers/evaluation/evaluateDeployment";
import { evaluateContract } from "../helpers/evaluation/evaluateContract";
import { writeEvaluation } from "../helpers/evaluation/writeEvaluation";
import { Evaluation } from "../types";
import { getLogger } from "../helpers/evaluation/getLogger";
import { getDummyData } from "../helpers/evaluation/getDummyData";
import { Address } from "viem";
import { extractGasCosts } from "../helpers/evaluation/extractGasCosts";

/**
 Example:
 npx hardhat evaluateHaLoNFCMetadataRegistry \
   --network localhost
 */
task("evaluateHaLoNFCMetadataRegistry", "Evaluates the HaLo NFC Metadata Registry contract")
  .addParam<Address>("from", "The address to send from")
  .setAction(async (taskArgs, hre) => {
    const contractName = "HaLoNFCMetadataRegistry";

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

    // Preparation: set dummy data
    const dummy = await getDummyData(hre);

    const crudFunctions = {
      create: async () => {
        const { response: txReceipt, performance: performance } = await evaluateFunction(async () => {
          const txHash = await contract.write.initMetadataURI([
            dummy.chipAddress,
            dummy.signatureFromChip,
            dummy.blockNumberUsedInSig,
            dummy.passportDataURI,
          ]);
          return await publicClient.waitForTransactionReceipt({ hash: txHash });
        });

        const { gasUsed, effectiveGasPriceInWei, gasCostsInWei } = extractGasCosts(txReceipt);
        evaluation.create.push({
          functionName: "initMetadataURI",
          gasUsed,
          effectiveGasPriceInWei,
          gasCostsInWei,
          ...performance,
        });
      },
      read: async () => {
        const { response: metadataURI, performance } = await evaluateFunction(async () => {
          return await contract.read.metadataURIs([dummy.chipAddress]);
        });

        logger.info(`read metadataURI ${metadataURI}`);

        evaluation.read.push({
          functionName: "metadataURIs",
          gasUsed: 0,
          effectiveGasPriceInWei: 0,
          gasCostsInWei: 0,
          ...performance,
        });
      },
      update: async () => {},
      delete: async () => {},
    };

    await evaluateContract(hre, contractName, crudFunctions);
    await writeEvaluation(hre, contractName, evaluation);
  });
