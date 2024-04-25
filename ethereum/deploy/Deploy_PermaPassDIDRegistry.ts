import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import fs from "fs"
import path from "path"
import prettier from "prettier"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { deployer, owner } = await hre.getNamedAccounts()
	const chainId = await hre.getChainId()

	const deployment = await hre.deployments.deploy("PermaPassDIDRegistry", {
		from: deployer,
		log: true,
	})

	const address = deployment.address
	const abi = JSON.stringify(deployment.abi, null, 2)

	const tsCode = `export const deployments = {
		${chainId}: {
			address: "${address}",
			abi: ${abi}
		}
	} as const;`

	const formattedCode = await prettier.format(tsCode, {
		parser: "typescript",
		singleQuote: false,
		trailingComma: "all",
		tabWidth: 2,
		semi: true,
	})

	const dir = `../app/contracts/`
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir)
	}

	fs.writeFileSync(path.join(dir, "PermaPassDIDRegistry.ts"), formattedCode)
}
export default func
func.tags = ["PermaPassDIDRegistry"]
