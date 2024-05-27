import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { api } from "../lib/web-api";
import { PassportMetadata, PassportCreate } from "../types";
import { SecondaryButton } from "../components/ui/buttons";
import { commonColors } from "../styles";
import { useContracts } from "../hooks/blockchain/useContracts";
import { useAsyncEffect } from "../hooks/useAsyncEffect";
import { useModal } from "../context/InfoModalContext";

interface PassportCardProps {
  passport: PassportCreate;
  passportMetadata: PassportMetadata;
  setVersion: React.Dispatch<React.SetStateAction<number>>;
}

export default function PassportCard({ passport, passportMetadata, setVersion }: PassportCardProps) {
  const { openGasFeesModal } = useModal();
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const { nftRegistry, didRegistry } = useContracts();

  const handleUpdate = async () => {
    const passportDataURI = await api.arweave.uploadPassport({
      name: `${passport.name} UPDATED`,
      condition: `${passport.condition} UPDATED`,
    });

    switch (passportMetadata.type) {
      case "nft":
        await openGasFeesModal({
          content: "Updating an NFT-based passport costs gas fees.",
          onConfirm: async () => {
            if (!nftRegistry.updateTokenURI) {
              throw new Error("nftRegistry updateTokenURI not available");
            }
            await nftRegistry.updateTokenURI(passportMetadata.tokenId, passportDataURI);
          },
        });
        break;
      case "did":
        await openGasFeesModal({
          content: "Updating a DID-based passport costs gas fees.",
          onConfirm: async () => {
            if (!didRegistry.addDIDService) {
              throw new Error("didRegistry addDIDService not available");
            }
            await didRegistry.addDIDService(passportMetadata.did, passportDataURI);
          },
        });
        break;
      default:
        throw new Error(`Unknown passport type`);
    }

    // Reload history
    setVersion((prevVersion) => prevVersion + 1);
  };

  const handleDelete = async () => {
    switch (passportMetadata.type) {
      case "nft":
        await openGasFeesModal({
          content: "Deleting an NFT-based passport costs gas fees.",
          onConfirm: async () => {
            if (!nftRegistry.deleteNFT) {
              throw new Error("nftRegistry deleteNFT not available");
            }
            await nftRegistry.deleteNFT(passportMetadata.tokenId);
          },
        });
        break;
      case "did":
        await openGasFeesModal({
          content: "Deleting a DID-based passport costs gas fees.",
          onConfirm: async () => {
            if (!didRegistry.deleteDID) {
              throw new Error("didRegistry deleteDID not available");
            }
            await didRegistry.deleteDID(passportMetadata.did);
          },
        });
        break;
      default:
        throw new Error(`Unknown passport type`);
    }

    // Reload history
    setVersion((prevVersion) => prevVersion + 1);
  };

  useAsyncEffect(async () => {
    if (!passportMetadata || !passport || !nftRegistry?.isOwner || !didRegistry?.isOwner) {
      return;
    }
    switch (passportMetadata.type) {
      case "nft":
        setIsOwner(await nftRegistry.isOwner(passportMetadata));
        setIsDeleted(await nftRegistry.isDeleted(passportMetadata));
        break;
      case "did":
        setIsOwner(await didRegistry.isOwner(passportMetadata));
        setIsDeleted(await didRegistry.isDeleted(passportMetadata));
        break;
      default:
        throw new Error(`Unknown passport type`);
    }
  }, [passport, passportMetadata, didRegistry, nftRegistry]);

  return (
    <View style={styles.container}>
      <View style={styles.attributesContainer}>
        {Object.entries(passport).map(([key, value]) => (
          <View key={key}>
            <Text style={styles.attributeKey}>{key}</Text>
            <Text style={styles.attributeValue}>{value}</Text>
          </View>
        ))}
      </View>
      {isOwner && (
        <View style={styles.buttonContainer}>
          <SecondaryButton title="Update" onPress={handleUpdate} />
          <SecondaryButton title="Delete" onPress={handleDelete} />
        </View>
      )}
      {isDeleted && <Text style={styles.deleted}>This passport has been deleted</Text>}
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
  attributesContainer: {
    flexDirection: "column",
    gap: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 10,
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
  deleted: {
    fontSize: 14,
    textAlign: "center",
    color: commonColors.red,
  },
});
