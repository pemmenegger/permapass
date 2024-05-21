import React from "react";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi-react-native";
import { Pressable, View, StyleSheet, Text } from "react-native";
import { commonColors, commonStyles } from "../styles";
import { WalletIcon } from "./icons/WalletIcon";

export default function WalletConnector() {
  const { open } = useWeb3Modal();
  const { selectedNetworkId } = useWeb3ModalState();
  const { isConnected, address } = useAccount();
  const { chains } = useNetwork();
  const { data } = useBalance({ address });

  const getNetworkName = (networkId?: number) => {
    const chain = chains.find((chain) => chain.id === networkId);
    return chain ? chain.name : "Unknown";
  };

  const shortenedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const networkName = getNetworkName(selectedNetworkId);

  // only 4 decimals
  const balance = data ? `${data.formatted.slice(0, -data.decimals + 4)} ${data.symbol}` : 0;

  return (
    <Pressable style={styles.button} onPress={async () => await open()}>
      {isConnected ? (
        <View style={styles.isConnectedContainer}>
          <View>
            <Text style={styles.subtext}>Address</Text>
            <Text style={styles.text}>{shortenedAddress}</Text>
          </View>
          <View>
            <Text style={styles.subtext}>Balance</Text>
            <Text style={styles.text}>{balance}</Text>
          </View>
          <View>
            <Text style={styles.subtext}>Network</Text>
            <Text style={styles.text}>{networkName}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.isDisconnectedContainer}>
          <View style={styles.icon}>
            <WalletIcon height={15} strokeWidth={1.2} color={commonColors.black} />
          </View>
          <Text style={styles.text}>Connect Wallet</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    backgroundColor: commonColors.primary,
    paddingHorizontal: commonStyles.innerMarginHorizontal,
    borderColor: commonColors.secondary,
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
  subtext: {
    fontFamily: "Inter-SemiBold",
    letterSpacing: -0.1,
    fontSize: 12,
    color: commonColors.secondary,
  },
  text: {
    fontFamily: "Inter-Medium",
    letterSpacing: -0.2,
    fontSize: 14,
    color: commonColors.black,
  },
  icon: {
    marginRight: 8,
  },
});
