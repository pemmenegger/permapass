import { DeployResult } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import fs from "fs"
import path from "path"
import prettier from "prettier"

interface ExportContractProps {
	hre: HardhatRuntimeEnvironment
	deployment: DeployResult
	contractName: string
}

/**
 * Exports contract deployment details (address and ABI) to the `app/contracts` directory
 * in the React Native app, allowing the app to interact with the contract.
 */
export const exportContractDetails = async ({ hre, deployment, contractName }: ExportContractProps) => {
	const chainId = await hre.getChainId()
	const outputDir = path.resolve(__dirname, "../../app/contracts/")
	const outputFilePath = path.join(outputDir, `${contractName}.ts`)

	let existingContent = {}

	// read existing content if it exists
	if (fs.existsSync(outputFilePath)) {
		const fileContent = fs.readFileSync(outputFilePath, "utf-8")
		const jsonContent = fileContent.replace(/export\s+const\s+\w+\s+=\s+/, "").replace(/as\s+const;/, "")
		existingContent = eval(`(${jsonContent})`)
	}

	// add the new deployment details
	const deploymentDetails = {
		...existingContent,
		abi: deployment.abi,
		[chainId]: deployment.address,
	}

	// format the details
	const formattedDetails = await prettier.format(
		`export const ${contractName} = ${JSON.stringify(deploymentDetails, null, 2)} as const;`,
		{
			parser: "typescript",
			singleQuote: false,
			trailingComma: "all",
			tabWidth: 2,
			semi: true,
		}
	)

	// write the details to the file
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true })
	}

	fs.writeFileSync(outputFilePath, formattedDetails)
}
