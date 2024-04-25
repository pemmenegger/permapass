import { task } from "hardhat/config"

/**
 Example:
 npx hardhat block-number \
   --network localhost
 */
task("block-number", "Prints the current block number", async (_, { viem }) => {
	const client = await viem.getPublicClient()
	const blockNumber = await client.getBlockNumber()
	console.log("Current block number:", blockNumber)
})
