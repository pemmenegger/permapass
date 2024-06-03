import hre from "hardhat";
import fs from "fs";
import path from "path";
import { Evaluation } from "../types";

interface ExistingContent {
  contractName: string;
  [chainId: number]: Record<string, any>[];
}

/**
 * Exports contract evaluation details to the `results` directory.
 */
export const exportEvaluation = async ({
  contractName,
  evaluation,
}: {
  contractName: string;
  evaluation: Evaluation;
}) => {
  const outputDir = path.resolve(__dirname, "../results/");
  const outputFilePath = path.join(outputDir, `${contractName}.json`);

  let existingContent: ExistingContent = { contractName };

  // read existing content if it exists
  if (fs.existsSync(outputFilePath)) {
    const fileContent = fs.readFileSync(outputFilePath, "utf-8");
    existingContent = JSON.parse(fileContent) as ExistingContent;
  }

  const chainId = hre.network.name === "localhost" ? 31337 : hre.network.config.chainId;

  if (!chainId) {
    throw new Error("Chain ID not found in network config");
  }

  const evaluationResults: ExistingContent = {
    ...existingContent,
    [chainId]: [...(existingContent[chainId] || []), evaluation],
  };

  const formattedEvaluation = JSON.stringify(evaluationResults, null, 2);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFilePath, formattedEvaluation, "utf-8");
};
