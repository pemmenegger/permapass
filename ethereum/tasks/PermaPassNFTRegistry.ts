import { task } from "hardhat/config"
import { PermaPassNFTRegistry } from "../../app/contracts/PermaPassNFTRegistry"
import { getWalletClient } from "../helpers/getWalletClient"
;(BigInt.prototype as any).toJSON = function () {
	return this.toString()
}

/**
 Example:
 npx hardhat PermaPassNFTRegistry-mint \
   --contract 0x77337983A7D1699FaF51a5f43b9907fB7B614097 \
   --recipient 0x73faDd7E476a9Bc2dA6D1512A528366A3E50c3cF \
   --uri https://ipfs.io/ipfs/new-token-uri-ipfs-hash \
   --network sepolia
 */
task("PermaPassNFTRegistry-mint", "Mint token for PermaPassNFTRegistry Smart Contract")
	.addParam<string>("contract", "PermaPassNFTRegistry Smart Contract Address")
	.addParam<string>("recipient", "NFT Token Recipient")
	.addParam<string>("uri", "NFT Token URI")
	.setAction(async (taskArgs, { viem }) => {
		const contract = await viem.getContractAt("PermaPassNFTRegistry", taskArgs.contract)

		console.log("Minting token...")
		console.log(`Recipient: ${taskArgs.recipient}`)
		console.log(`Token URI: ${taskArgs.uri}`)
		const hash = await contract.write.safeMint([taskArgs.recipient, taskArgs.uri])
		console.log(`Transaction Hash: ${hash}`)
		// await tx.wait(2)
		// console.log("Transaction confirmed")

		const publicClient = await viem.getPublicClient()
		await publicClient.waitForTransactionReceipt({ hash })
		console.log("Transaction confirmed")
	})

/**
 Example:
 npx hardhat PermaPassNFTRegistry-token-uri \
   --contract 0x77337983A7D1699FaF51a5f43b9907fB7B614097 \
   --id 1 \
   --network sepolia
 */
task("PermaPassNFTRegistry-token-uri", "Get token URI for PermaPassNFTRegistry Smart Contract")
	.addParam<string>("contract", "PermaPassNFTRegistry Smart Contract Address")
	.addParam<string>("id", "Token ID")
	.setAction(async (taskArgs, { viem }) => {
		const contract = await viem.getContractAt("PermaPassNFTRegistry", taskArgs.contract)

		const tokenURI = await contract.read.tokenURI([taskArgs.id])
		console.log(`Token URI: ${tokenURI}`)
	})

/**
 Example:
 npx hardhat PermaPassNFTRegistry-evaluate-safeMint \
   --iterations 10 \
   --network localhost
 */
task("PermaPassNFTRegistry-evaluate-safeMint", "Mint token for PermaPassNFTRegistry Smart Contract")
	.addParam<number>("iterations", "Number of iterations to evaluate")
	.setAction(async (taskArgs, { viem }) => {
		const publicClient = await viem.getPublicClient()

		const dummyTokenURI = "ar://rgiLrvb-FXtlcbrA5LP-b-ytIkUXXNnk19X-oEhprAs"

		const walletClient = await getWalletClient(viem)
		for (let i = 0; i < taskArgs.iterations; i++) {
			const txHash = await walletClient.writeContract({
				address: PermaPassNFTRegistry["31337"],
				abi: PermaPassNFTRegistry.abi,
				functionName: "safeMint",
				args: [walletClient.account.address, dummyTokenURI],
			})
			// const txHash = await walletClient.write.safeMint([dummyRecipient, dummyTokenURI])
			console.log(`txHash: ${txHash}`)
			const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
			console.log(txReceipt.gasUsed)
			// console.log(`txReceipt: ${JSON.stringify(txReceipt, null, 2)}`)
		}
	})
