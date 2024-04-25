import "fast-text-encoding";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "../lib/wagmi";

export default function Layout() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <StatusBar style="auto" />
      <Stack />
    </WagmiConfig>
  );
}
