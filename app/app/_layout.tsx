import "../global";
import "@walletconnect/react-native-compat";
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import { StatusBar } from "expo-status-bar";
import { Slot, Stack } from "expo-router";
import { WagmiConfig } from "wagmi";
import { chains } from "../lib/blockchain/wagmi";
import { createWeb3Modal, defaultWagmiConfig, W3mButton, Web3Modal } from "@web3modal/wagmi-react-native";
import { CreationProvider } from "../context/CreationContext";
import config from "../lib/config";
import { SafeAreaView } from "react-native";

const projectId = config.WALLETCONNECT_CLOUD_PROJECT_ID;

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

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function Layout() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <CreationProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        <Web3Modal />
      </CreationProvider>
    </WagmiConfig>
  );
}
