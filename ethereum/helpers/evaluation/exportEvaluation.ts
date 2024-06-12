import fs from "fs";
import path from "path";
import { ContractEvaluation, DataUploadEvaluation, EvaluationPerformance } from "../../types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getLogger } from "./getLogger";

interface ExistingContractEvaluationContent {
  contractName: string;
  [chainId: number]: Record<string, any>[];
}

interface ExistingDataUploadContent {
  create: EvaluationPerformance[];
  update: EvaluationPerformance[];
}

export const exportContractEvaluation = async (
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  evaluation: ContractEvaluation
) => {
  const logger = getLogger(hre, contractName);
  try {
    logger.info(`Exporting evaluation results...`);
    const outputDir = path.resolve(__dirname, "../../../evaluation/data/");
    const outputFilePath = path.join(outputDir, `${contractName}.json`);

    let existingContent: ExistingContractEvaluationContent = { contractName };

    // read existing content if it exists
    if (fs.existsSync(outputFilePath)) {
      const fileContent = fs.readFileSync(outputFilePath, "utf-8");
      existingContent = JSON.parse(fileContent) as ExistingContractEvaluationContent;
    }

    const chainId = hre.network.name === "localhost" ? 31337 : hre.network.config.chainId;

    if (!chainId) {
      throw new Error("Chain ID not found in network config");
    }

    const evaluationResults: ExistingContractEvaluationContent = {
      ...existingContent,
      [chainId]: [...(existingContent[chainId] || []), evaluation],
    };

    const formattedEvaluation = JSON.stringify(evaluationResults, null, 2);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFilePath, formattedEvaluation, "utf-8");
    logger.info(`Export successful`);
  } catch (e) {
    logger.error(`Export error: ${e}`);
    throw e;
  }
};

export const exportDataUploadEvaluation = async (
  hre: HardhatRuntimeEnvironment,
  fileName: string,
  evaluation: DataUploadEvaluation
) => {
  const logger = getLogger(hre, fileName);
  try {
    logger.info(`Exporting evaluation results...`);
    const outputDir = path.resolve(__dirname, "../../../evaluation/data/");
    const outputFilePath = path.join(outputDir, `${fileName}.json`);

    let existingContent: ExistingDataUploadContent = {
      create: [],
      update: [],
    };

    // read existing content if it exists
    if (fs.existsSync(outputFilePath)) {
      const fileContent = fs.readFileSync(outputFilePath, "utf-8");
      existingContent = JSON.parse(fileContent) as ExistingDataUploadContent;
    }

    const chainId = hre.network.name === "localhost" ? 31337 : hre.network.config.chainId;

    if (!chainId) {
      throw new Error("Chain ID not found in network config");
    }

    const evaluationResults: ExistingDataUploadContent = {
      create: [...existingContent.create, ...evaluation.create],
      update: [...existingContent.update, ...evaluation.update],
    };

    const formattedEvaluation = JSON.stringify(evaluationResults, null, 2);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFilePath, formattedEvaluation, "utf-8");
    logger.info(`Export successful`);
  } catch (e) {
    logger.error(`Export error: ${e}`);
    throw e;
  }
};
