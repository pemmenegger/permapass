import "../global";
import "@walletconnect/react-native-compat";

import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { WagmiConfig } from "wagmi";
import { chains } from "../lib/wagmi";
import { createWeb3Modal, defaultWagmiConfig, Web3Modal } from "@web3modal/wagmi-react-native";
import { CreationProvider } from "../context/CreationContext";
import config from "../lib/config";
import { useFonts } from "expo-font";
import { ModalProvider } from "../context/ModalContext";
import { PropsWithChildren } from "react";

const projectId = config.WALLETCONNECT_CLOUD_PROJECT_ID;

const metadata = {
  name: "PermaPass",
  description: "PermaPass manages decentralized product passports for circular construction",
  url: "https://permapass.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
  redirect: {
    native: "com.permapass.app://",
    universal: "permapass.com",
  },
};

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
});

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <CreationProvider>
      <ModalProvider>{children}</ModalProvider>
    </CreationProvider>
  );
};

export default function Layout() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <Providers>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        <Web3Modal />
      </Providers>
    </WagmiConfig>
  );
}
