import { task } from "hardhat/config"
import { formatEther } from "viem"

/**
 Example:
 npx hardhat balance \
   --account 0x77337983A7D1699FaF51a5f43b9907fB7B614097 \
   --network localhost
 */
task("balance", "Prints an account's balance")
	.addParam("account", "The account's address")
	.setAction(async (taskArgs, { viem }) => {
		const publicClient = await viem.getPublicClient()
		const balance = await publicClient.getBalance({
			address: taskArgs.account,
		})
		console.log(formatEther(balance), "ETH")
	})
