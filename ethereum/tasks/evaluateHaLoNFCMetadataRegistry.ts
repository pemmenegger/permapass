import { task } from "hardhat/config";
import { evaluateFunction } from "../helpers/evaluation/evaluateFunction";
import { evaluateDeployment } from "../helpers/evaluation/evaluateDeployment";
import { evaluateContract } from "../helpers/evaluation/evaluateContract";
import { exportContractEvaluation } from "../helpers/evaluation/exportEvaluation";
import { ContractEvaluation } from "../types";
import { getLogger } from "../helpers/evaluation/getLogger";
import { getDummyData } from "../helpers/evaluation/getDummyData";

/**
 Example:
 npx hardhat evaluateHaLoNFCMetadataRegistry \
   --network localhost
 */

task("evaluateHaLoNFCMetadataRegistry", "Evaluates the HaLo NFC Metadata Registry contract", async (_taskArgs, hre) => {
  const contractName = "HaLoNFCMetadataRegistry";

  const logger = getLogger(hre, contractName);
  const publicClient = await hre.viem.getPublicClient();

  const evaluation: ContractEvaluation = {
    deployment: [],
    create: [],
    read: [],
    update: [],
    delete: [],
  };

  const contractAddress = await evaluateDeployment(hre, contractName, evaluation);
  const contract = await hre.viem.getContractAt(contractName, contractAddress);

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

      evaluation.create.push({
        functionName: "initMetadataURI",
        gasUsedInWei: Number(txReceipt.gasUsed),
        ...performance,
      });
    },
    read: async () => {
      const { performance } = await evaluateFunction(async () => {
        const metadataURI = await contract.read.metadataURIs([dummy.chipAddress]);
        logger.info(`read metadataURI ${metadataURI}`);
      });

      evaluation.read.push({
        functionName: "metadataURIs",
        gasUsedInWei: 0,
        ...performance,
      });
    },
    update: async () => {},
    delete: async () => {},
  };

  await evaluateContract(hre, contractName, crudFunctions);
  await exportContractEvaluation(hre, contractName, evaluation);
});
