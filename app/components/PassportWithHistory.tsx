import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { usePassportHistory } from "../hooks/usePassportHistory";
import { api } from "../lib/web-api";
import { Passport, PassportMetadata } from "../types";
import { SecondaryButton } from "../components/ui/buttons";
import { commonColors } from "../styles";
import { useContracts } from "../hooks/blockchain/useContracts";
import { useModal } from "../context/InfoModalContext";
import { GasFeesModal } from "../context/InfoModalContext/modals";
import { LoadingSpinnerIcon } from "./icons/LoadingSpinnerIcon";
import LoadingText from "./LoadingText";

export default function PassportWithHistory({ passportMetadata }: { passportMetadata: PassportMetadata }) {
  const [currentPassport, setCurrentPassport] = useState<Passport | null>(null);
  const [version, setVersion] = useState(0);
  const { passportHistory, isLoading, error } = usePassportHistory({ passportMetadata, version });
  const { nftRegistry, didRegistry } = useContracts();
  const { openModal } = useModal();

  useEffect(() => {
    setCurrentPassport(passportHistory[0]);
  }, [passportHistory]);

  const update = async () => {
    if (!currentPassport) return console.log("No passport");

    const passportDataURI = await api.arweave.uploadPassport({
      name: `${currentPassport.name} UPDATED`,
      condition: `${currentPassport.condition} UPDATED`,
    });

    switch (passportMetadata.type) {
      case "nft":
        const nftPromise = new Promise<void>((resolve, reject) => {
          openModal(
            <GasFeesModal
              content="Updating an NFT-based passport costs gas fees."
              onConfirm={async () => {
                try {
                  if (!nftRegistry.updateTokenURI) {
                    throw new Error("nftRegistry updateTokenURI not available");
                  }
                  await nftRegistry.updateTokenURI(passportMetadata.tokenId, passportDataURI);
                  resolve();
                } catch (error) {
                  reject();
                  throw new Error("Failed to create NFT");
                }
              }}
            />
          );
        });
        await nftPromise;
        break;
      case "did":
        const didPromise = new Promise<void>((resolve, reject) => {
          openModal(
            <GasFeesModal
              content="Updating a DID-based passport costs gas fees."
              onConfirm={async () => {
                try {
                  if (!didRegistry.addDIDService) {
                    throw new Error("didRegistry addDIDService not available");
                  }
                  await didRegistry.addDIDService(passportMetadata.did, passportDataURI);
                  resolve();
                } catch (error) {
                  reject();
                  throw new Error("Failed to create NFT");
                }
              }}
            />
          );
        });
        await didPromise;
        break;
      default:
        throw new Error(`Unknown passport type`);
    }

    // Reload history
    setVersion((prevVersion) => prevVersion + 1);
  };

  if (isLoading) {
    return <LoadingText isLoading={true} text="Loading Passport" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  if (!currentPassport) {
    return <Text>No passport available</Text>;
  }

  return (
    <>
      <View style={styles.passportContainer}>
        {Object.entries(currentPassport).map(([key, value]) => (
          <View key={key} style={styles.passportAttribute}>
            <Text style={styles.passportAttributeName}>{key}</Text>
            <Text style={styles.passportAttributeValue}>{value}</Text>
          </View>
        ))}
        <SecondaryButton title="Update" onPress={update} />
      </View>
      <View style={styles.timelineContainer}>
        {passportHistory.map((record, index) => (
          <View key={index} style={styles.timelineRecord}>
            <Text style={styles.timelineDate}>{record.condition}</Text>
            <Text style={styles.timelineText}>{record.name}</Text>
          </View>
        ))}
      </View>
    </>
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
    marginBottom: 20,
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
  timelineContainer: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  timelineRecord: {
    marginBottom: 12,
  },
  timelineDate: {
    fontSize: 12,
    color: commonColors.gray,
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 16,
    color: commonColors.black,
  },
});
