import React from "react";
import { useWeb3Modal } from "@web3modal/wagmi-react-native";
import { Pressable, View, StyleSheet, Text } from "react-native";
import { useWalletClient } from "wagmi";
import { commonColors } from "../styles";

export default function WalletConnector() {
  const { open } = useWeb3Modal();
  const { data: walletClient } = useWalletClient();

  return (
    <Pressable style={styles.button} onPress={async () => await open()}>
      {walletClient?.chain ? (
        <View style={styles.isConnectedContainer}>
          <Text style={styles.text}>{walletClient?.chain.name}</Text>
        </View>
      ) : (
        <View style={styles.isDisconnectedContainer}>
          <Text style={styles.text}>Connect Wallet</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 32,
    backgroundColor: commonColors.primary,
    marginVertical: 12,
    marginHorizontal: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  isConnectedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  isDisconnectedContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: commonColors.white,
    fontSize: 16,
  },
});
