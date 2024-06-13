import hre from "hardhat";

/*
 * Run this script using the following command:
 * npx hardhat run scripts/evaluate.ts --network <network>
 */
async function main() {
  console.log("Compiling contracts...");
  await hre.run("compile");
  console.log("Contracts compiled");

  await hre.run("evaluateDIDRegistry");
  await hre.run("evaluateHaLoNFCMetadataRegistry");
  await hre.run("evaluateNFTRegistry");
  await hre.run("evaluatePBTRegistry");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
