import "@walletconnect/react-native-compat";
import { WagmiConfig } from "wagmi";
import { sepolia } from "viem/chains";
import { createWeb3Modal, defaultWagmiConfig, Web3Modal } from "@web3modal/wagmi-react-native";
import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { defineChain } from "viem";
import { Stack } from "expo-router";

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_CLOUD_PROJECT_ID;

if (!projectId) {
  throw new Error("Missing projectId");
}

// 2. Create config
const metadata = {
  name: "PermaPass",
  description: "PermaPass manages decentralized product passports for circular construction",
  url: "https://permapass.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
  redirect: {
    native: "permapass://",
    universal: "permapass.com",
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

const chains = [sepolia, hardhat];

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <StatusBar style="auto" />
      <Stack />
      <Web3Modal />
    </WagmiConfig>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
