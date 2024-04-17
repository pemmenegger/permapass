import "@walletconnect/react-native-compat";
import "@sinonjs/text-encoding";
import "react-native-get-random-values";
import "@ethersproject/shims";
import "cross-fetch/polyfill";

import { StatusBar } from "expo-status-bar";
import { WagmiConfig } from "wagmi";
import { mainnet, polygon, arbitrum, sepolia, goerli } from "viem/chains";
import { createWeb3Modal, defaultWagmiConfig, Web3Modal } from "@web3modal/wagmi-react-native";
import { Stack } from "expo-router";
import { defineChain } from "viem";

// polyfill BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_CLOUD_PROJECT_ID;

if (!projectId) {
  throw new Error("Missing projectId");
}

// 2. Create config
const metadata = {
  name: "Web3Modal RN",
  description: "Web3Modal RN Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
  redirect: {
    native: "YOUR_APP_SCHEME://",
    universal: "YOUR_APP_UNIVERSAL_LINK.com",
  },
};

const macbookIP = "192.168.91.91";

export const hardhat = defineChain({
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

const chains = [mainnet, polygon, arbitrum, hardhat, sepolia, goerli];

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function Layout() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <StatusBar style="auto" />
      <Stack />
      <Web3Modal />
    </WagmiConfig>
  );
}
