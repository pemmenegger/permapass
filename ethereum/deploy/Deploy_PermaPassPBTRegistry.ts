import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { exportContractDetails } from "../helpers/exportContractDetails"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const contractName = "PermaPassPBTRegistry"
	const { deployer } = await hre.getNamedAccounts()

	const deployment = await hre.deployments.deploy(contractName, {
		from: deployer,
		log: true,
	})

	await exportContractDetails({ hre, deployment, contractName })
}
export default func
func.tags = ["PermaPassPBTRegistry"]
