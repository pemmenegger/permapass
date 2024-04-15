import { task } from "hardhat/config"

/**
 Example:
 hardhat PermaPassRegistry-mint \
   --contract 0x77337983A7D1699FaF51a5f43b9907fB7B614097 \
   --recipient 0x73faDd7E476a9Bc2dA6D1512A528366A3E50c3cF \
   --uri https://ipfs.io/ipfs/new-token-uri-ipfs-hash \
   --network sepolia
 */
task("PermaPassRegistry-mint", "Mint token for PermaPassRegistry Smart Contract")
	.addParam<string>("contract", "PermaPassRegistry Smart Contract Address")
	.addParam<string>("recipient", "NFT Token Recipient")
	.addParam<string>("uri", "NFT Token URI")
	.setAction(async (taskArgs, { viem }) => {
		const contract = await viem.getContractAt("PermaPassRegistry", taskArgs.contract)

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
 hardhat PermaPassRegistry-token-uri \
   --contract 0x77337983A7D1699FaF51a5f43b9907fB7B614097 \
   --id 1 \
   --network sepolia
 */
task("PermaPassRegistry-token-uri", "Get token URI for PermaPassRegistry Smart Contract")
	.addParam<string>("contract", "PermaPassRegistry Smart Contract Address")
	.addParam<string>("id", "Token ID")
	.setAction(async (taskArgs, { viem }) => {
		const contract = await viem.getContractAt("PermaPassRegistry", taskArgs.contract)

		const tokenURI = await contract.read.tokenURI([taskArgs.id])
		console.log(`Token URI: ${tokenURI}`)
	})
