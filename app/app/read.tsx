import React, { useState } from "react";
import { Button, Text, View } from "react-native";
import { usePassportMetadata } from "../hooks/usePassportMetadata";
import { useReadQueryParams } from "../hooks/useReadQueryParams";
import { usePassportHistory } from "../hooks/usePassportHistory";
import { api } from "../lib/web-api";
import { useNFTRegistry } from "../hooks/blockchain/useNFTRegistry";
import { useDIDRegistry } from "../hooks/blockchain/useDIDRegistry";
import ViewWithWalletConnector from "../components/ui/ViewWithWalletConnector";
import { Passport, PassportMetadata } from "../types";

const MetadataDisplay = ({
  isLoading,
  error,
  metadata,
}: {
  isLoading: boolean;
  error?: string;
  metadata?: PassportMetadata;
}) => (
  <>
    {isLoading && <Text>Loading metadata...</Text>}
    {error && <Text>Error Metadata: {error}</Text>}
    <Text>Metadata:</Text>
    <Text>{JSON.stringify(metadata, null, 2)}</Text>
  </>
);

const HistoryDisplay = ({ isLoading, error, history }: { isLoading: boolean; error?: string; history: Passport[] }) => (
  <>
    {isLoading && <Text>Loading passport...</Text>}
    {error && <Text>Error Passport: {error}</Text>}
    <Text>History:</Text>
    {history.length === 0 ? (
      <Text>No history found</Text>
    ) : (
      history.map((passport, index) => <Text key={index}>{JSON.stringify(passport, null, 2)}</Text>)
    )}
  </>
);

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
    const passportURI = await api.arweave.uploadPassport({
      name: `${passport.name} UPDATED`,
      condition: `${passport.condition} UPDATED`,
    });

    switch (passportMetadata.type) {
      case "nft":
        await nftRegistry.updateTokenURI(passportMetadata.tokenId, passportURI);
        break;
      case "did":
        await didRegistry.addDIDService(passportMetadata.did, passportURI);
        break;
      default:
        throw new Error(`Unknown passport type`);
    }

    // Reload history
    setVersion((prevVersion) => prevVersion + 1);
  };

  return (
    <ViewWithWalletConnector>
      <MetadataDisplay isLoading={isMetadataLoading} error={metadataError} metadata={passportMetadata} />
      <Text>-----</Text>
      <HistoryDisplay isLoading={isPassportHistoryLoading} error={passportHistoryError} history={passportHistory} />
      <Button title="Update" onPress={update} />
    </ViewWithWalletConnector>
  );
}
