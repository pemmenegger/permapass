import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { PassportMetadata as Metadata } from "../types";
import { commonColors } from "../styles";
import LoadingText from "./LoadingText";
import { formatAddress, formatDID, formatNetworkName } from "../lib/utils";
import { chains } from "../lib/wagmi";

interface PassportMetadataProps {
  metadata?: Metadata;
  isLoading: boolean;
  error?: string;
}

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoBlockContainer}>
    <Text style={styles.text}>{label}</Text>
    <Text style={styles.text}>{value}</Text>
  </View>
);

export default function PassportMetadata({ metadata, isLoading, error }: PassportMetadataProps) {
  if (isLoading) {
    return <LoadingText isLoading={true} text="Loading Passport Metadata" />;
  }

  if (error) {
    return <Text>Error Metadata: {error}</Text>;
  }

  if (!metadata) {
    return <Text>No metadata available</Text>;
  }

  const address = formatAddress(metadata.address);
  const networkName = formatNetworkName(chains, metadata.chainId);

  const renderMetadataContent = () => {
    switch (metadata.type) {
      case "nft":
        return (
          <>
            <InfoBlock label="Token Id" value={metadata.tokenId.toString()} />
            <InfoBlock label="NFT Registry Address" value={address} />
            <InfoBlock label="Network" value={networkName} />
          </>
        );
      case "pbt":
        return (
          <>
            <InfoBlock label="Token Id" value={metadata.tokenId.toString()} />
            <InfoBlock label="PBT Registry Address" value={address} />
            <InfoBlock label="Network" value={networkName} />
          </>
        );
      case "did":
        return (
          <>
            <InfoBlock label="DID" value={formatDID(metadata.did)} />
            <InfoBlock label="DID Registry Address" value={address} />
            <InfoBlock label="Network" value={networkName} />
          </>
        );
      default:
        return null;
    }
  };

  return <View style={{ marginBottom: 20 }}>{renderMetadataContent()}</View>;
}

const styles = StyleSheet.create({
  infoBlockContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontFamily: "Inter-SemiBold",
    letterSpacing: -0.1,
    fontSize: 12,
    color: commonColors.secondary,
  },
});
