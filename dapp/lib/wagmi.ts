import { hardhat as baseHardhat, sepolia as baseSepolia } from "viem/chains";
import { createPublicClient, defineChain } from "viem";
import { http } from "viem";
import config from "./config";

const hardhat = defineChain({
  ...baseHardhat,
  rpcUrls: {
    default: { http: [config.HARDHAT_RPC_URL] },
    public: { http: [config.HARDHAT_RPC_URL] },
  },
});

const sepolia = defineChain({
  ...baseSepolia,
  rpcUrls: {
    infura: {
      http: [`https://sepolia.infura.io/v3/${config.INFURA_PROJECT_ID}`],
      webSocket: [`wss://sepolia.infura.io/ws/v3/${config.INFURA_PROJECT_ID}`],
    },
    default: {
      http: [`https://sepolia.infura.io/v3/${config.INFURA_PROJECT_ID}`],
    },
    public: {
      http: [`https://sepolia.infura.io/v3/${config.INFURA_PROJECT_ID}`],
    },
  },
});

const chains = config.ENVIRONMENT == "dev" ? [hardhat, sepolia] : [sepolia];

const hardhatPublicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

const sepoliaPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const getPublicClient = (chainId?: number) => {
  switch (chainId) {
    case hardhat.id:
      return hardhatPublicClient;
    case sepolia.id:
      return sepoliaPublicClient;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
};

export { getPublicClient, chains };
