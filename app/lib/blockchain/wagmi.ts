import { hardhat as baseHardhat, sepolia as baseSepolia } from "viem/chains";
import { publicProvider } from "wagmi/providers/public";
import { createPublicClient, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, Address } from "viem";
// import { BrowserProvider } from "ethers";
import config from "../config";
import { PermaPassNFTRegistry } from "../../contracts/PermaPassNFTRegistry";
import { PermaPassDIDRegistry } from "../../contracts/PermaPassDIDRegistry";

const hardhat = defineChain({
  ...baseHardhat,
  rpcUrls: {
    default: { http: [config.HARDHAT_RPC_URL] },
    public: { http: [config.HARDHAT_RPC_URL] },
  },
  contracts: {
    PermaPassNFTRegistry: {
      address: PermaPassNFTRegistry[baseHardhat.id as keyof typeof PermaPassNFTRegistry].address,
      abi: PermaPassNFTRegistry[baseHardhat.id as keyof typeof PermaPassNFTRegistry].abi,
    },
    PermaPassDIDRegistry: {
      address: PermaPassDIDRegistry[baseHardhat.id as keyof typeof PermaPassDIDRegistry].address,
      abi: PermaPassDIDRegistry[baseHardhat.id as keyof typeof PermaPassDIDRegistry].abi,
    },
  },
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

// const { publicClient: configPublicClient, webSocketPublicClient } = configureChains(chains, [publicProvider()]);

// const wagmiConfig = createConfig({
//   publicClient: configPublicClient,
//   webSocketPublicClient,
// });

const walletClient = createWalletClient({
  account: privateKeyToAccount(config.PRIVATE_KEY as Address),
  chain: hardhat,
  transport: http(),
});

const hardhatClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

// TODO remove
const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

// const getBrowserProvider = () => {
//   const { chain, transport } = walletClient;
//   const network = {
//     chainId: chain.id,
//     name: chain.name,
//   };
//   return new BrowserProvider(transport, network);
// };

// const browserProvider = getBrowserProvider();

export { hardhat, walletClient, hardhatClient, publicClient, chains };
