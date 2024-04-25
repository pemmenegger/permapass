import { createConfig, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, Address } from "viem";
import { BrowserProvider } from "ethers";

const macbookIP = "192.168.91.91";

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
    default: { http: [`http://${macbookIP}:8545`] },
    public: { http: [`http://${macbookIP}:8545`] },
  },
});

const { publicClient, webSocketPublicClient } = configureChains([hardhat], [publicProvider()]);

const wagmiConfig = createConfig({
  publicClient,
  webSocketPublicClient,
});

const PRIVATE_KEY = process.env.EXPO_PUBLIC_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("EXPO_PUBLIC_PRIVATE_KEY is required");
}

const walletClient = createWalletClient({
  account: privateKeyToAccount(PRIVATE_KEY as Address),
  chain: hardhat,
  transport: http(),
});

const getBrowserProvider = () => {
  const { chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
  };
  return new BrowserProvider(transport, network);
};

const browserProvider = getBrowserProvider();

export { wagmiConfig, hardhat, walletClient, browserProvider };
