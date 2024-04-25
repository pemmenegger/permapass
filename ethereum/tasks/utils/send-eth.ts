import { task } from "hardhat/config"
import { parseEther } from "viem"

/**
 Example:
 npx hardhat send-eth \
   --recipient 0x77337983A7D1699FaF51a5f43b9907fB7B614097 \
   --value 100 \
   --network localhost
 */
task("send-eth", "Send ETH to an address")
	.addParam<string>("recipient", "Recipient of ETH")
	.addParam<string>("value", "Amount of ETH to send")
	.setAction(async (taskArgs, { viem }) => {
		const [walletClient] = await viem.getWalletClients()
		const publicClient = await viem.getPublicClient()

		console.log(`Sending ${taskArgs.value} ETH to ${taskArgs.recipient}`)
		const hash = await walletClient.sendTransaction({
			to: taskArgs.recipient,
			value: parseEther(taskArgs.value),
		})
		console.log(`Transaction Hash: ${hash}`)

		await publicClient.waitForTransactionReceipt({ hash })
		console.log("Transaction confirmed")
	})
