import "@walletconnect/react-native-compat";

import React, { useEffect } from "react";
import { Linking, SafeAreaView, StyleSheet } from "react-native";

import { createWeb3Modal, defaultConfig, W3mButton, Web3Modal } from "@web3modal/ethers-react-native";
import { FlexView, Text } from "@web3modal/ui-react-native";

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = "b55857a61792b3656e2052f00b4763e3";

// 2. Define your chains
const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};

const polygon = {
  chainId: 137,
  name: "Polygon",
  currency: "MATIC",
  explorerUrl: "https://polygonscan.com",
  rpcUrl: "https://polygon-rpc.com",
};

const chains = [mainnet, polygon];

// 3. Create config
const metadata = {
  name: "W3M ethers",
  description: "Web3Modal with Ethers",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
  redirect: {
    native: "rn-w3m-ethers-sample://",
  },
};

const config = defaultConfig({
  metadata,
});

// 3. Create modal
createWeb3Modal({
  projectId,
  chains,
  config,
});

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} variant="large-600">
        Web3Modal + ethers
      </Text>
      <FlexView style={styles.buttonContainer}>
        <W3mButton balance="show" />
      </FlexView>
      <Web3Modal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 16,
  },
  buttonContainer: {
    gap: 8,
  },
  title: {
    marginBottom: 40,
    fontSize: 30,
  },
});

export default App;
