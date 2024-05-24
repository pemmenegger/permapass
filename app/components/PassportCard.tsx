import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { api } from "../lib/web-api";
import { PassportMetadata, PassportCreate } from "../types";
import { SecondaryButton } from "../components/ui/buttons";
import { commonColors } from "../styles";
import { useContracts } from "../hooks/blockchain/useContracts";
import { useModal } from "../context/InfoModalContext";
import { GasFeesModal } from "../context/InfoModalContext/modals";

interface PassportCardProps {
  passport: PassportCreate;
  passportMetadata: PassportMetadata;
  setVersion: React.Dispatch<React.SetStateAction<number>>;
}

export default function PassportCard({ passport, passportMetadata, setVersion }: PassportCardProps) {
  const { nftRegistry, didRegistry } = useContracts();
  const { openModal } = useModal();

  const handleUpdate = async () => {
    const passportDataURI = await api.arweave.uploadPassport({
      name: `${passport.name} UPDATED`,
      condition: `${passport.condition} UPDATED`,
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

  return (
    <View style={styles.container}>
      {Object.entries(passport).map(([key, value]) => (
        <View key={key} style={styles.attributeContainer}>
          <Text style={styles.attributeKey}>{key}</Text>
          <Text style={styles.attributeValue}>{value}</Text>
        </View>
      ))}
      <SecondaryButton title="Update" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: commonColors.secondary,
    backgroundColor: commonColors.white,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  attributeContainer: {
    marginBottom: 20,
  },
  attributeKey: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    textTransform: "uppercase",
  },
  attributeValue: {
    fontSize: 32,
    color: commonColors.gray,
  },
});
