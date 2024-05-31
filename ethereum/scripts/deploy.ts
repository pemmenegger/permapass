import hre from "hardhat";
import { exportContractDetails } from "../helpers/exportContractDetails";

const deployContract = async ({
  contractName,
  shouldExport = false,
}: {
  contractName: string;
  shouldExport?: boolean;
}) => {
  console.log(`\nDeploying ${contractName}...`);
  const contract = await hre.viem.deployContract(contractName);
  console.log(`Deployed to ${contract.address}`);

  if (shouldExport) {
    await exportContractDetails({ contractName, contractAbi: contract.abi, contractAddress: contract.address });
    console.log(`Contract details exported`);
  }

  return contract;
};

/*
 * Run this script using the following command:
 * npx hardhat run scripts/deploy.ts --network <localhost | sepolia>
 */
async function main() {
  console.log("Compiling contracts...");
  await hre.run("compile");

  await deployContract({
    contractName: "PermaPassDIDRegistry",
    shouldExport: true,
  });

  await deployContract({
    contractName: "PermaPassNFTRegistry",
    shouldExport: true,
  });

  await deployContract({
    contractName: "PermaPassPBTRegistry",
    shouldExport: true,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
