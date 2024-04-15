import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox-viem"

import "hardhat-deploy"
import "@nomiclabs/hardhat-solhint"
import "solidity-coverage"

import "dotenv/config"

import "./tasks/utils/accounts"
import "./tasks/utils/balance"
import "./tasks/utils/block-number"
import "./tasks/utils/send-eth"

import "./tasks/PermaPassRegistry"

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY

if (!ALCHEMY_API_KEY) {
	throw new Error("ALCHEMY_API_KEY is not defined in environment variables.")
} else if (!ETHERSCAN_API_KEY) {
	throw new Error("ETHERSCAN_API_KEY is not defined in environment variables.")
} else if (!PRIVATE_KEY) {
	throw new Error("PRIVATE_KEY is not defined in environment variables.")
}

const config: HardhatUserConfig = {
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			accounts: [
				{
					privateKey: PRIVATE_KEY,
					balance: "10000000000000000000000",
				},
			],
			chainId: 31337,
		},
		sepolia: {
			url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
			accounts: [PRIVATE_KEY],
		},
	},
	etherscan: {
		// Your API key for Etherscan
		// Obtain one at https://etherscan.io/
		apiKey: {
			mainnet: ETHERSCAN_API_KEY,
			sepolia: ETHERSCAN_API_KEY,
		},
	},
	namedAccounts: {
		deployer: {
			default: 0, // here this will by default take the first account as deployer
			mainnet: 0, // similarly on mainnet it will take the first account as deployer.
		},
		owner: {
			default: 0,
		},
	},
	solidity: {
		compilers: [
			{
				version: "0.8.20",
			},
		],
	},
}

export default config
