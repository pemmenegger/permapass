import React, { useState } from "react";
import { Alert, Text } from "react-native";
import { usePassportHistory } from "../../hooks/usePassportHistory";
import { PassportMetadata } from "../../types";
import LoadingText from "../ui/LoadingText";
import PassportCard from "./PassportCard";
import { useModal } from "../../context/ModalContext";
import { useContracts } from "../../hooks/blockchain/useContracts";
import { api } from "../../lib/web-api";
import { pickPassportJSON } from "../../lib/utils";
import PassportTimeline from "./PassportTimeline";

export default function PassportRead({ passportMetadata }: { passportMetadata: PassportMetadata }) {
  const [version, setVersion] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { openGasFeesModal } = useModal();
  const { nftRegistry, pbtRegistry, didRegistry } = useContracts();

  const { passportHistory, isLoading, error } = usePassportHistory({ passportMetadata, version });
  const currentPassport = passportHistory && passportHistory.entries.length ? passportHistory.entries[0].data : null;

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);

      const passportData = await pickPassportJSON();
      if (!passportData) return;
      const passportDataURI = await api.arweave.uploadPassport(passportData);

      const { type } = passportMetadata;
      switch (type) {
        case "nft":
          await openGasFeesModal({
            content: "Updating an NFT-based passport costs gas fees.",
            onConfirm: async () => {
              if (!nftRegistry.updateTokenURI) throw new Error("nftRegistry updateTokenURI not available");
              await nftRegistry.updateTokenURI(passportMetadata.tokenId, passportDataURI);
            },
          });
          break;
        case "pbt":
          await openGasFeesModal({
            content: "Updating a PBT-based passport costs gas fees.",
            onConfirm: async () => {
              if (!pbtRegistry.updateTokenURI) throw new Error("pbtRegistry updatePBT not available");
              await pbtRegistry.updateTokenURI(passportMetadata.tokenId, passportDataURI);
            },
          });
          break;
        case "did":
          await openGasFeesModal({
            content: "Updating a DID-based passport costs gas fees.",
            onConfirm: async () => {
              if (!didRegistry.addDIDService) throw new Error("didRegistry addDIDService not available");
              await didRegistry.addDIDService(passportMetadata.did, passportDataURI);
            },
          });
          break;
        default:
          throw new Error(`Invalid passport metadata type: ${type}`);
      }

      // Reload history
      setVersion((prevVersion) => prevVersion + 1);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while updating the passport.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const { type } = passportMetadata;
      switch (type) {
        case "nft":
          await openGasFeesModal({
            content: "Deleting an NFT-based passport costs gas fees.",
            onConfirm: async () => {
              if (!nftRegistry.deleteNFT) throw new Error("nftRegistry deleteNFT not available");
              await nftRegistry.deleteNFT(passportMetadata.tokenId);
            },
          });
          break;
        case "pbt":
          await openGasFeesModal({
            content: "Deleting a PBT-based passport costs gas fees.",
            onConfirm: async () => {
              if (!pbtRegistry.deletePBT) throw new Error("pbtRegistry deletePBT not available");
              await pbtRegistry.deletePBT(passportMetadata.tokenId);
            },
          });
          break;
        case "did":
          await openGasFeesModal({
            content: "Deleting a DID-based passport costs gas fees.",
            onConfirm: async () => {
              if (!didRegistry.deleteDID) throw new Error("didRegistry deleteDID not available");
              await didRegistry.deleteDID(passportMetadata.did);
            },
          });
          break;
        default:
          throw new Error(`Invalid passport metadata type: ${type}`);
      }

      // Reload history
      setVersion((prevVersion) => prevVersion + 1);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while deleting the passport.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isUpdating) {
    return <LoadingText isLoading={true} text="Updating Passport" />;
  }

  if (isDeleting) {
    return <LoadingText isLoading={true} text="Deleting Passport" />;
  }

  if (isLoading) {
    return <LoadingText isLoading={true} text="Loading Passport" />;
  }

  if (error) {
    console.error(error);
    return <Text>An error occurred while loading the passport history.</Text>;
  }

  if (!currentPassport) {
    return <Text>No passport available</Text>;
  }

  if (!passportHistory) {
    return <Text>No passport history available</Text>;
  }

  return (
    <>
      <PassportCard
        passportData={currentPassport}
        ownerAddress={passportHistory.ownerAddress}
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
      />
      <PassportTimeline historyEntries={passportHistory.entries} />
    </>
  );
}
