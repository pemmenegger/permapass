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

const chains = [sepolia, hardhat];

// const walletClient = createWalletClient({
//   account: privateKeyToAccount(config.PRIVATE_KEY as Address),
//   chain: hardhat,
//   transport: http(),
// });

const getPublicClient = (chainId?: number) => {
  switch (chainId) {
    case hardhat.id:
      return createPublicClient({
        chain: hardhat,
        transport: http(),
      });
    default:
      return null;
  }
};

export { getPublicClient, chains };
