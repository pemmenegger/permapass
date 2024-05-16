import { Button, Text, View } from "react-native";
import { usePassportMetadata } from "../hooks/usePassportMetadata";
import { useReadQueryParams } from "../hooks/useReadQueryParams";
import { usePassportHistory } from "../hooks/usePassportHistory";
import { api } from "../lib/web-api";
import { useState } from "react";
import { useNFTRegistry } from "../hooks/useNFTRegistry";
import { useDIDRegistry } from "../hooks/useDIDRegistry";

export default function Page() {
  const { didRegistry } = useDIDRegistry();
  const [version, setVersion] = useState(0);
  const { nftRegistry } = useNFTRegistry();
  const { metadataURI } = useReadQueryParams();
  const { passportMetadata, isLoading: isMetadataLoading, error: metadataError } = usePassportMetadata({ metadataURI });
  const {
    passportHistory,
    isLoading: isPassportHistoryLoading,
    error: passportHistoryError,
  } = usePassportHistory({ passportMetadata, version });

  const update = async () => {
    if (!passportMetadata) {
      console.log("No passport metadata");
      return;
    }
    if (!passportHistory || passportHistory.length === 0) {
      console.log("No passport");
      return;
    }
    if (nftRegistry.updateTokenURI === undefined) {
      console.log("updateTokenURI not available");
      return;
    }
    if (didRegistry.addDIDService === undefined) {
      console.log("addDIDService not available");
      return;
    }

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

    // reload history
    setVersion((prevVersion) => prevVersion + 1);
  };

  if (isMetadataLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading metadata...</Text>
      </View>
    );
  }

  if (metadataError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error Metadata: {metadataError}</Text>
      </View>
    );
  }

  if (isPassportHistoryLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading passport...</Text>
      </View>
    );
  }

  if (passportHistoryError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error Passport: {passportHistoryError}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      {passportHistory.map((passport, index) => (
        <Text key={index}>{JSON.stringify(passport, null, 2)}</Text>
      ))}
      <Button title="Update" onPress={update} />
    </View>
  );
}
