import React, { useMemo } from "react";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi-react-native";
import { Pressable, View, StyleSheet, Text } from "react-native";
import { commonColors, commonStyles } from "../styles";
import { WalletIcon } from "./icons/WalletIcon";

const ConnectedView = ({
  address,
  balanceSymbol,
  balanceValue,
  networkName,
}: {
  address: string;
  balanceSymbol: string;
  balanceValue: string;
  networkName: string;
}) => (
  <View style={styles.isConnectedContainer}>
    <InfoBlock label="Address" value={address} />
    <InfoBlock label={balanceSymbol} value={balanceValue} />
    <InfoBlock label="Network" value={networkName} />
  </View>
);

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
  const { selectedNetworkId } = useWeb3ModalState();
  const { isConnected, address } = useAccount();
  const { chains } = useNetwork();
  const { data, error } = useBalance({ address });

  const formatNetworkName = (networkId?: number) => {
    const chain = chains.find((chain) => chain.id === networkId);
    return chain ? chain.name : "Unknown";
  };

  const formatBalance = (formatted?: string) => {
    if (!formatted) {
      return "0";
    }
    const num = parseFloat(formatted);
    if (isNaN(num)) {
      throw new Error("Invalid number format");
    }
    return num.toFixed(Math.min(4, (num.toString().split(".")[1] || "").length));
  };

  const formatAddress = (address?: string) => {
    if (!address) {
      return "";
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formattedAddress = useMemo(() => formatAddress(address), [address]);
  const formattedBalance = useMemo(() => formatBalance(data?.formatted), [data?.formatted]);
  const formattedNetworkName = useMemo(() => formatNetworkName(selectedNetworkId), [selectedNetworkId]);

  if (error) {
    console.error("Error fetching wallet balance: ", error);
  }

  return (
    <Pressable style={styles.button} onPress={async () => await open()}>
      {isConnected ? (
        <ConnectedView
          address={formattedAddress}
          balanceSymbol={data?.symbol || ""}
          balanceValue={formattedBalance}
          networkName={formattedNetworkName}
        />
      ) : (
        <DisconnectedView />
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
