import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

import "dotenv/config";

import "./tasks/evaluateDIDRegistry";
import "./tasks/evaluateHaLoNFCMetadataRegistry";
import "./tasks/evaluateNFTRegistry";
import "./tasks/evaluatePBTRegistry";

const INFURA_API_KEY = process.env.INFURA_API_KEY;
if (!INFURA_API_KEY) throw new Error("Please set INFURA_API_KEY in the .env file");

const PRIVATE_KEY_ONE = process.env.PRIVATE_KEY_ONE;
if (!PRIVATE_KEY_ONE) throw new Error("Please set PRIVATE_KEY_ONE in the .env file");
if (PRIVATE_KEY_ONE.startsWith("0x")) throw new Error("PRIVATE_KEY_ONE should not start with 0x");

const PRIVATE_KEY_TWO = process.env.PRIVATE_KEY_TWO;
if (!PRIVATE_KEY_TWO) throw new Error("Please set PRIVATE_KEY_TWO in the .env file");
if (PRIVATE_KEY_TWO.startsWith("0x")) throw new Error("PRIVATE_KEY_TWO should not start with 0x");

const PRIVATE_KEY_THREE = process.env.PRIVATE_KEY_THREE;
if (!PRIVATE_KEY_THREE) throw new Error("Please set PRIVATE_KEY_THREE in the .env file");
if (PRIVATE_KEY_THREE.startsWith("0x")) throw new Error("PRIVATE_KEY_THREE should not start with 0x");

const PRIVATE_KEY_FOUR = process.env.PRIVATE_KEY_FOUR;
if (!PRIVATE_KEY_FOUR) throw new Error("Please set PRIVATE_KEY_FOUR in the .env file");
if (PRIVATE_KEY_FOUR.startsWith("0x")) throw new Error("PRIVATE_KEY_FOUR should not start with 0x");

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: [
        {
          privateKey: PRIVATE_KEY_ONE,
          balance: "10000000000000000000000",
        },
        {
          privateKey: PRIVATE_KEY_TWO,
          balance: "10000000000000000000000",
        },
        {
          privateKey: PRIVATE_KEY_THREE,
          balance: "10000000000000000000000",
        },
        {
          privateKey: PRIVATE_KEY_FOUR,
          balance: "10000000000000000000000",
        },
      ],
      chainId: 31337,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY_ONE, PRIVATE_KEY_TWO, PRIVATE_KEY_THREE, PRIVATE_KEY_FOUR],
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
