import fs from "fs";
import path from "path";
import { Evaluation } from "../../types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getLogger } from "./getLogger";

interface ExistingEvaluationContent {
  contractName: string;
  [chainId: number]: Record<string, any>[];
}

export const writeEvaluation = async (hre: HardhatRuntimeEnvironment, contractName: string, evaluation: Evaluation) => {
  const logger = getLogger(hre, contractName);
  try {
    logger.info(`Writing evaluation results...`);
    const outputDir = path.resolve(__dirname, "../../../evaluation/data/");
    const outputFilePath = path.join(outputDir, `${contractName}.json`);

    let existingContent: ExistingEvaluationContent = { contractName };

    // read existing content if it exists
    if (fs.existsSync(outputFilePath)) {
      const fileContent = fs.readFileSync(outputFilePath, "utf-8");
      existingContent = JSON.parse(fileContent) as ExistingEvaluationContent;
    }

    const chainId = hre.network.name === "localhost" ? 31337 : hre.network.config.chainId;

    if (!chainId) {
      throw new Error("Chain ID not found in network config");
    }

    const evaluationResults: ExistingEvaluationContent = {
      ...existingContent,
      [chainId]: [...(existingContent[chainId] || []), evaluation],
    };

    const formattedEvaluation = JSON.stringify(evaluationResults, null, 2);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFilePath, formattedEvaluation, "utf-8");
    logger.info(`Writing successful`);
  } catch (e) {
    logger.error(`Error during writing: ${e}`);
    throw e;
  }
};
