import { createConfig, configureChains, sepolia } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { createPublicClient, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, Address } from "viem";
// import { BrowserProvider } from "ethers";
import config from "./config";

const hardhat = defineChain({
  id: 31_337,
  name: "Hardhat",
  network: "hardhat",
  nativeCurrency: {
    decimals: 18,
    name: "hhEther",
    symbol: "hhETH",
  },
  rpcUrls: {
    default: { http: [config.HARDHAT_RPC_URL] },
    public: { http: [config.HARDHAT_RPC_URL] },
  },
});

const chains = [sepolia, hardhat];

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

const initWalletClient = (privateKey: string) => {
  const account = privateKeyToAccount(privateKey as Address);
  return createWalletClient({
    account,
    chain: hardhat,
    transport: http(),
  });
};

export { hardhat, walletClient, publicClient, chains, initWalletClient };
