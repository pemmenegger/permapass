import React from "react";
import { useAccount, useNetwork } from "wagmi";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi-react-native";
import { Pressable, View, StyleSheet, Text } from "react-native";
import { commonColors, commonStyles } from "../styles";
import { WalletIcon } from "./icons/WalletIcon";

export default function WalletConnector() {
  const { open } = useWeb3Modal();
  const { selectedNetworkId } = useWeb3ModalState();
  const { isConnected, address } = useAccount();
  const { chains } = useNetwork();

  const getNetworkName = (networkId?: number) => {
    const chain = chains.find((chain) => chain.id === networkId);
    return chain ? chain.name : "Unknown";
  };

  const shortenedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const networkName = getNetworkName(selectedNetworkId);

  return (
    <Pressable style={styles.button} onPress={async () => await open()}>
      {isConnected ? (
        <View style={styles.isConnectedContainer}>
          <Text style={styles.text}>{shortenedAddress}</Text>
          <Text style={styles.text}>{networkName}</Text>
        </View>
      ) : (
        <View style={styles.isDisconnectedContainer}>
          <View style={styles.icon}>
            <WalletIcon height={15} strokeWidth={1.05} color={commonColors.black} />
          </View>
          <Text style={styles.text}>Connect Wallet</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
    borderRadius: 32,
    backgroundColor: commonColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    // elevation: 2,
    // shadowColor: commonColors.black,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
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
    fontFamily: "Inter-Regular",
    letterSpacing: -0.5,
    fontSize: 16,
    color: commonColors.black,
  },
  icon: {
    marginRight: 8,
  },
});
