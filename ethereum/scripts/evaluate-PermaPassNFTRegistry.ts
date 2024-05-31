import hre from "hardhat";
import { evaluateTransaction } from "../helpers/evaluateTransaction";
import { Evaluation } from "../types";
import PermaPassNFTRegistry from "../artifacts/contracts/PermaPassNFTRegistry.sol/PermaPassNFTRegistry.json";
import { Address, Hex } from "viem";

/*
 * Run this script using the following command:
 * npx hardhat run scripts/deploy.ts --network <localhost | sepolia>
 */
async function main() {
    console.log("Compiling contracts...");
    await hre.run("compile");

    const publicClient = await hre.viem.getPublicClient()
    const [walletClient] = await hre.viem.getWalletClients();

	const contractName = "PermaPassNFTRegistry"
	const evaluation: Evaluation = { contractName }

    let contractAddress: string | undefined
	try {
		console.log(`Deploying ${contractName}...`)
		const { txReceipt, performance } = await evaluateTransaction(
			async () => {
                const deploymentTxHash = await walletClient.deployContract({
                    abi: PermaPassNFTRegistry.abi,
                    account: walletClient.account,
                    bytecode: PermaPassNFTRegistry.bytecode as Hex
                })

                const txReceipt = await publicClient.waitForTransactionReceipt({
                    hash: deploymentTxHash,
                    confirmations: 1
                  });

                return txReceipt
            })

		if (!txReceipt || !txReceipt.contractAddress) {
            throw new Error("Deployment failed")
		}

        contractAddress = txReceipt.contractAddress
        evaluation.deployment = {
            gasUsed: Number(txReceipt.gasUsed),
            performance,
        }
		console.log(`Deployed to ${contractAddress}`)
	} catch (e) {
		console.log(e)
		throw e
	}  

    if (!contractAddress) {
		throw new Error("Contract address is missing")
	}

    // connect contract with default wallet
	const contract = await hre.viem.getContractAt("PermaPassNFTRegistry", contractAddress as Address)

    // measure gas used and execution time of creation
	try {
		console.log(`Evaluate Creation...`)
		const { txReceipt, performance } = await evaluateTransaction(async () => {
			const txHash = await contract.write.safeMint([walletClient.account.address, "ar://rgiLrvb-FXtlcbrA5LP-b-ytIkUXXNnk19X-oEhprAs"])
			const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
			return txReceipt
		})

		if (!txReceipt) {
			throw new Error("Creation failed")
		}

		evaluation.create = {
			gasUsed: Number(txReceipt.gasUsed),
			performance,
		}
		console.log(`Creation successful`)
	} catch (e) {
		console.log(e)
		throw e
	}

    // measure execution time of read (tokenURI)
	try {
		console.log(`Evaluate Read...`)
		const { performance } = await evaluateTransaction(async () => {
			await contract.read.tokenURI([1])
		})

		evaluation.read = {
			performance,
		}
		console.log(`Read successful`)
	} catch (e) {
		console.log(e)
		throw e
	}

	// measure gas and execution time of update (setTokenURI)
	try {
		console.log(`Evaluate Update...`)
		const { txReceipt, performance } = await evaluateTransaction(async () => {
			const txHash = await contract.write.setTokenURI([1, "ar://rgiLrvb-FXtlcbrA5LP-b-ytIkUXXNnk19X-oEhprAS"])
			const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
			return txReceipt
		})

		if (!txReceipt) {
			throw new Error("Update failed")
		}

		evaluation.update = {
			gasUsed: Number(txReceipt.gasUsed),
			performance,
		}
		console.log(`Update successful`)
	} catch (e) {
		console.log(e)
		throw e
	}

	// measure gas and execution time of deletion (burn)
	try {
		console.log(`Evaluate Delete...`)
		const { txReceipt, performance } = await evaluateTransaction(async () => {
			const txHash = await contract.write.burn([1])
			const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
			return txReceipt
		})

		if (!txReceipt) {
			throw new Error("Deletion failed")
		}

		evaluation.delete = {
			gasUsed: Number(txReceipt.gasUsed),
			performance,
		}
		console.log(`Delete successful`)
	} catch (e) {
		console.log(e)
		throw e
	}

	console.log(evaluation)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
