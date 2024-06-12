import { task } from "hardhat/config";
import { ArweaveURI, DataUploadEvaluation } from "../types";
import { evaluateFunction } from "../helpers/evaluation/evaluateFunction";
import { exportDataUploadEvaluation } from "../helpers/evaluation/exportEvaluation";
import { getLogger } from "../helpers/evaluation/getLogger";

async function verifyWebApiStatus(apiUrl: string) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Web API is not responding correctly.");
    }
  } catch (error: unknown) {
    throw new Error("Web API is not running. Go to the web-api directory and run 'node ./api/index.mjs'");
  }
}

function loadPassportData() {
  try {
    const creationData = require("../../passport-create.json");
    const updateData = require("../../passport-update.json");
    if (!creationData || !updateData) {
      throw new Error("Passport data not found");
    }
    return { creationData, updateData };
  } catch (error: unknown) {
    throw new Error("Error loading passport data: " + (error as Error).message);
  }
}

async function uploadPassportData({ passportData }: { passportData: any }) {
  const response = await fetch("http://localhost:3000/arweave", {
    method: "POST",
    body: JSON.stringify(passportData),
  });
  const data = await response.json();
  const txid = data.txid;
  if (!txid) throw new Error("uploadToArweave - no txid in response");
  return `ar://${txid}` as ArweaveURI;
}

/**
 Example:
 npx hardhat evaluateDIDRegistry \
   --network localhost
 */
task("evaluateArweaveUpload", "Evaluates the Arweave data upload for passport data", async (_taskArgs, hre) => {
  await verifyWebApiStatus("http://localhost:3000");
  const { creationData, updateData } = loadPassportData();

  const contractName = "ArweaveUpload";

  const logger = getLogger(hre, contractName);

  const evaluation: DataUploadEvaluation = {
    create: [],
    update: [],
  };

  const { performance: creationPerformance } = await evaluateFunction(async () => {
    const creationDataURI = await uploadPassportData(creationData);
    logger.info(`Creation data URI: ${creationDataURI}`);
    return creationDataURI;
  });

  evaluation.create.push({
    ...creationPerformance,
  });

  const { performance: updatePerformance } = await evaluateFunction(async () => {
    const updateDataURI = await uploadPassportData(updateData);
    logger.info(`Update data URI: ${updateDataURI}`);
    return updateDataURI;
  });

  evaluation.update.push({
    ...updatePerformance,
  });

  await exportDataUploadEvaluation(hre, contractName, evaluation);
});
