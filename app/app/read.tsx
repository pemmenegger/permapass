import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { usePassportMetadata } from "../hooks/usePassportMetadata";
import { useReadQueryParams } from "../hooks/useReadQueryParams";
import { usePassportHistory } from "../hooks/usePassportHistory";
import { api } from "../lib/web-api";
import { useNFTRegistry } from "../hooks/blockchain/useNFTRegistry";
import { useDIDRegistry } from "../hooks/blockchain/useDIDRegistry";
import { Passport, PassportMetadata } from "../types";
import ViewWithHeader from "../components/ViewWithHeader";
import { SecondaryButton } from "../components/ui/buttons";
import StepTitle from "../components/stepper/StepTitle";
import { commonColors, commonStyles } from "../styles";

interface MetadataDisplayProps {
  isLoading: boolean;
  error?: string;
  metadata?: PassportMetadata;
}

const MetadataDisplay = ({ isLoading, error, metadata }: MetadataDisplayProps) => {
  if (isLoading) {
    return <Text>Loading metadata...</Text>;
  }

  if (error) {
    return <Text>Error Metadata: {error}</Text>;
  }

  if (!metadata) {
    return <Text>No metadata available</Text>;
  }

  const renderMetadataContent = () => {
    switch (metadata.type) {
      case "nft":
        return (
          <>
            <Text style={commonStyles.h4}>Token Id: {metadata.tokenId.toString()}</Text>
            <Text style={commonStyles.h4}>NFT Registry Address: {metadata.address}</Text>
            <Text style={commonStyles.h4}>Blockchain: {metadata.chainId}</Text>
          </>
        );
      case "pbt":
        return (
          <>
            <Text style={commonStyles.h4}>PBT Registry Address: {metadata.address}</Text>
            <Text style={commonStyles.h4}>Blockchain: {metadata.chainId}</Text>
          </>
        );
      case "did":
        return (
          <>
            <Text style={commonStyles.h4}>DID: {metadata.did}</Text>
            <Text style={commonStyles.h4}>DID Registry Address: {metadata.address}</Text>
            <Text style={commonStyles.h4}>Blockchain: {metadata.chainId}</Text>
          </>
        );
      default:
        return null;
    }
  };

  return <View style={{ marginBottom: 20 }}>{renderMetadataContent()}</View>;
};

interface HistoryDisplayProps {
  isLoading: boolean;
  error?: string;
  history: Passport[];
  update: () => void;
}

const HistoryDisplay = ({ isLoading, error, history, update }: HistoryDisplayProps) => {
  if (isLoading) {
    return <Text>Loading passport...</Text>;
  }

  if (error) {
    return <Text>Error Passport: {error}</Text>;
  }

  const currentPassport = history[0];
  if (!currentPassport) {
    return <Text>No passport available</Text>;
  }

  return (
    <View style={styles.passportContainer}>
      {Object.entries(currentPassport).map(([key, value]) => (
        <View key={key} style={styles.passportAttribute}>
          <Text style={styles.passportAttributeName}>{key}</Text>
          <Text style={styles.passportAttributeValue}>{value}</Text>
        </View>
      ))}
      <SecondaryButton title="Update" onPress={update} />
    </View>
  );
};

export default function Page() {
  const { didRegistry } = useDIDRegistry();
  const { nftRegistry } = useNFTRegistry();
  const { metadataURI } = useReadQueryParams();
  const [version, setVersion] = useState(0);

  const { passportMetadata, isLoading: isMetadataLoading, error: metadataError } = usePassportMetadata({ metadataURI });
  const {
    passportHistory,
    isLoading: isPassportHistoryLoading,
    error: passportHistoryError,
  } = usePassportHistory({ passportMetadata, version });

  const update = async () => {
    if (!passportMetadata) return console.log("No passport metadata");
    if (!passportHistory || passportHistory.length === 0) return console.log("No passport");
    if (!nftRegistry.updateTokenURI) return console.log("updateTokenURI not available");
    if (!didRegistry.addDIDService) return console.log("addDIDService not available");

    const passport = passportHistory[0];
    const passportDataURI = await api.arweave.uploadPassport({
      name: `${passport.name} UPDATED`,
      condition: `${passport.condition} UPDATED`,
    });

    switch (passportMetadata.type) {
      case "nft":
        await nftRegistry.updateTokenURI(passportMetadata.tokenId, passportDataURI);
        break;
      case "did":
        await didRegistry.addDIDService(passportMetadata.did, passportDataURI);
        break;
      default:
        throw new Error(`Unknown passport type`);
    }

    // Reload history
    setVersion((prevVersion) => prevVersion + 1);
  };

  return (
    <ViewWithHeader>
      {passportMetadata && (
        <StepTitle
          text={`You have read a ${passportMetadata.type.toUpperCase()}-based passport.`}
          highlight={`${passportMetadata.type.toUpperCase()}-based`}
        />
      )}
      <MetadataDisplay isLoading={isMetadataLoading} error={metadataError} metadata={passportMetadata} />
      {passportMetadata && (
        <HistoryDisplay
          isLoading={isPassportHistoryLoading}
          error={passportHistoryError}
          history={passportHistory}
          update={update}
        />
      )}
    </ViewWithHeader>
  );
}

const styles = StyleSheet.create({
  passportContainer: {
    borderWidth: 1,
    borderColor: commonColors.secondary,
    backgroundColor: commonColors.white,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  passportAttribute: {
    marginBottom: 20,
  },
  passportAttributeName: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    textTransform: "uppercase",
  },
  passportAttributeValue: {
    fontSize: 32,
    color: commonColors.gray,
  },
});
