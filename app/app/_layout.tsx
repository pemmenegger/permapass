import "../global.js";
import "../global.css";
import "@walletconnect/react-native-compat";
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "../lib/wagmi";
import { Web3Modal } from "@web3modal/wagmi-react-native";
import { CreationProvider } from "../context/CreationContext";

export default function Layout() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <CreationProvider>
        <StatusBar style="auto" />
        <Stack />
        <Web3Modal />
      </CreationProvider>
    </WagmiConfig>
  );
}
