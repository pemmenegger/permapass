import hre from "hardhat";

/*
 * Run this script using the following command:
 * npx hardhat run scripts/evaluate.ts --network <network>
 */
async function main() {
  console.log("Compiling contracts...");
  await hre.run("compile");
  console.log("Contracts compiled");

  const walletClients = await hre.viem.getWalletClients();
  if (walletClients.length !== 4) {
    throw new Error(
      `4 wallet clients are required. Currently, there are ${walletClients.length} wallet clients configured`
    );
  }

  const walletAddresses = walletClients.map((client) => client.account?.address);
  walletAddresses.forEach((address, index) => {
    if (!address) {
      throw new Error(`Wallet Client ${index + 1} address is not set`);
    }
    console.log(`Wallet Client ${index + 1}: ${address}`);
  });

  const executionCount = 1;
  for (let i = 0; i < executionCount; i++) {
    console.log(`\n--- Evaluation ${i + 1}/${executionCount} ---`);
    const start = Date.now();

    // run concurrently
    await Promise.all([
      hre.run("evaluateDIDRegistry", { from: walletAddresses[0] }),
      hre.run("evaluateHaLoNFCMetadataRegistry", { from: walletAddresses[1] }),
      hre.run("evaluateNFTRegistry", { from: walletAddresses[2] }),
      hre.run("evaluatePBTRegistry", { from: walletAddresses[3] }),
    ]);

    console.log(`Evaluation completed in ${(Date.now() - start) / 1000}s`);

    if (i < executionCount - 1) {
      // wait for 1 second before starting the evaluation
      console.log(`\nWaiting 3 second before starting next evaluation...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
