import { task } from "hardhat/config"

/**
 Example:
 npx hardhat accounts \
   --network localhost
 */
task("accounts", "Prints the list of accounts", async (_taskArgs, { viem }) => {
	const walletClients = await viem.getWalletClients()
	for (const walletClient of walletClients) {
		console.log(walletClient.account.address)
	}
})
