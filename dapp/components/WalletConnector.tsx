import React from "react";
import { useWeb3Modal } from "@web3modal/wagmi-react-native";
import { Pressable, View, StyleSheet, Text } from "react-native";
import { WalletClient, useBalance, useWalletClient } from "wagmi";
import { commonColors } from "../styles";
import { formatAddress, formatBalance, isSepoliaSwitchRequired } from "../lib/utils";
import { WalletIcon } from "./icons/WalletIcon";

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <View>
    <Text style={styles.subtext}>{label}</Text>
    <Text style={styles.text}>{value}</Text>
  </View>
);

const ConnectedView = ({ walletClient }: { walletClient: WalletClient }) => {
  const { data: balance } = useBalance({ address: walletClient.account.address, chainId: walletClient.chain.id });

  if (isSepoliaSwitchRequired(walletClient)) {
    return (
      <View style={styles.isDisconnectedContainer}>
        <Text style={styles.text}>Connect to the Sepolia network in your wallet app</Text>
      </View>
    );
  }

  return (
    <View style={styles.isConnectedContainer}>
      <InfoBlock label="Address" value={formatAddress(walletClient.account.address)} />
      {balance && <InfoBlock label={balance.symbol} value={formatBalance(balance.formatted)} />}
      <InfoBlock label="Network" value={walletClient.chain.name} />
    </View>
  );
};

const DisconnectedView = () => {
  return (
    <View style={styles.isDisconnectedContainer}>
      <View style={styles.icon}>
        <WalletIcon height={15} strokeWidth={1.2} color={commonColors.black} />
      </View>
      <Text style={styles.text}>Connect Wallet</Text>
    </View>
  );
};

export default function WalletConnector() {
  const { open } = useWeb3Modal();
  const { data: walletClient } = useWalletClient();

  return (
    <Pressable style={styles.button} onPress={async () => await open()}>
      {walletClient ? <ConnectedView walletClient={walletClient} /> : <DisconnectedView />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    backgroundColor: commonColors.primary,
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
