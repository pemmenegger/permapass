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
  // contracts: {
  //   PermaPassNFTRegistry: {
  //     address: PermaPassNFTRegistry[baseHardhat.id as keyof typeof PermaPassNFTRegistry].address,
  //     abi: PermaPassNFTRegistry[baseHardhat.id as keyof typeof PermaPassNFTRegistry].abi,
  //   },
  //   PermaPassDIDRegistry: {
  //     address: PermaPassDIDRegistry[baseHardhat.id as keyof typeof PermaPassDIDRegistry].address,
  //     abi: PermaPassDIDRegistry[baseHardhat.id as keyof typeof PermaPassDIDRegistry].abi,
  //   },
  // },
});

// const sepolia = defineChain({
//   ...baseSepolia,
//   contracts: {
//     ...baseSepolia.contracts,
//     PermaPassNFTRegistry: {
//       address: PermaPassNFTRegistry[baseSepolia.id as keyof typeof PermaPassNFTRegistry].address,
//       abi: PermaPassNFTRegistry[baseSepolia.id as keyof typeof PermaPassNFTRegistry].abi,
//     },
//     PermaPassDIDRegistry: {
//       address: PermaPassDIDRegistry[baseSepolia.id as keyof typeof PermaPassDIDRegistry].address,
//       abi: PermaPassDIDRegistry[baseSepolia.id as keyof typeof PermaPassDIDRegistry].abi,
//     },
//   },
// });

const chains = [hardhat];

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
