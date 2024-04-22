import "@walletconnect/react-native-compat";
import "@sinonjs/text-encoding";
import "react-native-get-random-values";
import "@ethersproject/shims";
import "cross-fetch/polyfill";

import { StatusBar } from "expo-status-bar";
import { WagmiConfig } from "wagmi";
import { mainnet, polygon, arbitrum, sepolia, goerli } from "viem/chains";
import { createWeb3Modal, defaultWagmiConfig, W3mButton, Web3Modal } from "@web3modal/wagmi-react-native";
import { Stack } from "expo-router";
import { defineChain } from "viem";
import config from "../lib/config";

// polyfill BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

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
    default: { http: [`http://${config.LOCALHOST_INTERNAL_IP}:8545`] },
    public: { http: [`http://${config.LOCALHOST_INTERNAL_IP}:8545`] },
  },
});

const chains = [mainnet, polygon, arbitrum, hardhat, sepolia, goerli];

const wagmiConfig = defaultWagmiConfig({ projectId: config.WALLETCONNECT_CLOUD_PROJECT_ID, chains, metadata });

// 3. Create modal
createWeb3Modal({
  projectId: config.WALLETCONNECT_CLOUD_PROJECT_ID,
  chains,
  wagmiConfig,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function Layout() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <StatusBar style="auto" />
      {/* <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerTintColor: "#000000",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      /> */}
      <Stack />
      <Web3Modal />
    </WagmiConfig>
  );
}
