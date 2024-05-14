import { Slot } from "expo-router";
import { createWeb3Modal, defaultWagmiConfig, W3mButton, Web3Modal } from "@web3modal/wagmi-react-native";
import { SafeAreaView } from "react-native";

export default function Layout() {
  return (
    <SafeAreaView>
      <W3mButton />
      <Slot />
    </SafeAreaView>
  );
}
