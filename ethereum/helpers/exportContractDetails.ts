import hre from "hardhat";
import fs from "fs";
import path from "path";
import prettier from "prettier";
import { Abi } from "viem";

export const exportContractDetails = async ({
  contractName,
  contractAbi,
  contractAddress,
}: {
  contractName: string;
  contractAbi: Abi;
  contractAddress: string;
}) => {
  const chainId = hre.network.name == "localhost" ? 31337 : hre.network.config.chainId;
  if (!chainId) {
    throw new Error("Chain ID not found in network config");
  }

  const outputDir = path.resolve(__dirname, "../../dapp/contracts/");
  const outputFilePath = path.join(outputDir, `${contractName}.ts`);

  let existingContent = {};

  if (fs.existsSync(outputFilePath)) {
    const fileContent = fs.readFileSync(outputFilePath, "utf-8");
    const jsonContent = fileContent.replace(/export\s+const\s+\w+\s+=\s+/, "").replace(/as\s+const;/, "");
    existingContent = eval(`(${jsonContent})`);
  }

  const deploymentDetails = {
    ...existingContent,
    abi: contractAbi,
    [chainId]: contractAddress,
  };

  const formattedDetails = await prettier.format(
    `export const ${contractName} = ${JSON.stringify(deploymentDetails, null, 2)} as const;`,
    {
      parser: "typescript",
      singleQuote: false,
      trailingComma: "all",
      tabWidth: 2,
      semi: true,
    }
  );

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFilePath, formattedDetails);
};
