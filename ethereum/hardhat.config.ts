import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

import "dotenv/config";

import "./tasks/evaluateArweaveUpload";
import "./tasks/evaluateDIDRegistry";
import "./tasks/evaluateHaLoNFCMetadataRegistry";
import "./tasks/evaluateNFTRegistry";
import "./tasks/evaluatePBTRegistry";

const INFURA_API_KEY = process.env.INFURA_API_KEY;
if (!INFURA_API_KEY) throw new Error("Please set INFURA_API_KEY in the .env file");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) throw new Error("Please set PRIVATE_KEY in the .env file");

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
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};

export default config;
