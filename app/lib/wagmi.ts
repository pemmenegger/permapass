import { createConfig, configureChains } from "wagmi";
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
    default: { http: [`http://${config.LOCALHOST_INTERNAL_IP}:8545`] },
    public: { http: [`http://${config.LOCALHOST_INTERNAL_IP}:8545`] },
  },
});

const { publicClient: configPublicClient, webSocketPublicClient } = configureChains([hardhat], [publicProvider()]);

const wagmiConfig = createConfig({
  publicClient: configPublicClient,
  webSocketPublicClient,
});

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

export { wagmiConfig, hardhat, walletClient, publicClient };
