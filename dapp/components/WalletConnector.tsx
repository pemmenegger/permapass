import React, { useMemo } from "react";
import { sepolia, useAccount, useBalance, useWalletClient } from "wagmi";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi-react-native";
import { Pressable, View, StyleSheet, Text } from "react-native";
import { commonColors } from "../styles";
import { WalletIcon } from "./icons/WalletIcon";
import { formatAddress, formatBalance, formatNetworkName } from "../lib/utils";
import { chains } from "../lib/wagmi";
import config from "../lib/config";

const ConnectedView = () => {
  const { selectedNetworkId } = useWeb3ModalState();
  const { address } = useAccount();
  const { data, error } = useBalance({ address });
  const { data: walletClient } = useWalletClient();

  const formattedAddress = useMemo(() => formatAddress(address), [address]);
  const formattedBalance = useMemo(() => formatBalance(data?.formatted), [data?.formatted]);
  const formattedNetworkName = useMemo(() => formatNetworkName(chains, selectedNetworkId), [selectedNetworkId]);

  if (error) {
    console.error("Error fetching wallet balance: ", error);
  }

  if (config.ENVIRONMENT != "prod" && walletClient && walletClient.chain.id != sepolia.id) {
    return (
      <View style={styles.isDisconnectedContainer}>
        <Text style={styles.text}>Connect to the Sepolia network in your wallet app</Text>
      </View>
    );
  }

  return (
    <View style={styles.isConnectedContainer}>
      <InfoBlock label="Address" value={formattedAddress} />
      <InfoBlock label={data?.symbol || ""} value={formattedBalance} />
      <InfoBlock label="Network" value={formattedNetworkName} />
    </View>
  );
};

const DisconnectedView = () => (
  <View style={styles.isDisconnectedContainer}>
    <View style={styles.icon}>
      <WalletIcon height={15} strokeWidth={1.2} color={commonColors.black} />
    </View>
    <Text style={styles.text}>Connect Wallet</Text>
  </View>
);

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <View>
    <Text style={styles.subtext}>{label}</Text>
    <Text style={styles.text}>{value}</Text>
  </View>
);

export default function WalletConnector() {
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();

  return (
    <Pressable style={styles.button} onPress={async () => await open()}>
      {isConnected ? <ConnectedView /> : <DisconnectedView />}
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
