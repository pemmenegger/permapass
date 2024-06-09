import { hardhat as baseHardhat, sepolia } from "viem/chains";
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

const chains = config.ENVIRONMENT == "dev" ? [hardhat, sepolia] : [sepolia];

const getPublicClient = (chainId?: number) => {
  switch (chainId) {
    case hardhat.id:
      return createPublicClient({
        chain: hardhat,
        transport: http(),
      });
    case sepolia.id:
      return createPublicClient({
        chain: sepolia,
        transport: http(),
      });
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
};

export { getPublicClient, chains };
