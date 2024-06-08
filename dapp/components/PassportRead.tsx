import React, { useState } from "react";
import { Text } from "react-native";
import { usePassportHistory } from "../hooks/usePassportHistory";
import { PassportMetadata } from "../types";
import LoadingText from "./LoadingText";
import PassportCard from "./PassportCard";
import PassportHistory from "./PassportHistory";
import { useModal } from "../context/ModalContext";
import { useContracts } from "../hooks/blockchain/useContracts";
import { api } from "../lib/web-api";
import { pickPassportJSON } from "../lib/utils";
import { useAsyncEffect } from "../hooks/useAsyncEffect";

export default function PassportRead({ passportMetadata }: { passportMetadata: PassportMetadata }) {
  const [version, setVersion] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const { openGasFeesModal } = useModal();
  const { nftRegistry, pbtRegistry, didRegistry } = useContracts();

  const { passportHistory, isLoading, error } = usePassportHistory({ passportMetadata, version });
  const currentPassport = passportHistory && passportHistory.length ? passportHistory[0].data : null;

  const handleUpdate = async () => {
    const passportData = await pickPassportJSON();
    if (!passportData) {
      return;
    }
    const passportDataURI = await api.arweave.uploadPassport(passportData);

    const { type } = passportMetadata;
    switch (type) {
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
      case "pbt":
        await openGasFeesModal({
          content: "Updating a PBT-based passport costs gas fees.",
          onConfirm: async () => {
            if (!pbtRegistry.updateTokenURI) {
              throw new Error("pbtRegistry updatePBT not available");
            }
            await pbtRegistry.updateTokenURI(passportMetadata.tokenId, passportDataURI);
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
        throw new Error(`Invalid passport metadata type: ${type}`);
    }

    // Reload history
    setVersion((prevVersion) => prevVersion + 1);
  };

  const handleDelete = async () => {
    const { type } = passportMetadata;
    switch (type) {
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
      case "pbt":
        await openGasFeesModal({
          content: "Deleting a PBT-based passport costs gas fees.",
          onConfirm: async () => {
            if (!pbtRegistry.deletePBT) {
              throw new Error("pbtRegistry deletePBT not available");
            }
            await pbtRegistry.deletePBT(passportMetadata.tokenId);
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
        throw new Error(`Invalid passport metadata type: ${type}`);
    }

    // Reload history
    setVersion((prevVersion) => prevVersion + 1);
  };

  useAsyncEffect(async () => {
    if (!passportMetadata) {
      return;
    }
    if (!nftRegistry?.isOwner || !pbtRegistry?.isOwner || !didRegistry?.isOwner) {
      return;
    }

    const { type } = passportMetadata;
    switch (type) {
      case "nft":
        setIsOwner(await nftRegistry.isOwner(passportMetadata));
        setIsDeleted(await nftRegistry.isDeleted(passportMetadata));
        break;
      case "pbt":
        setIsOwner(await pbtRegistry.isOwner(passportMetadata));
        setIsDeleted(await pbtRegistry.isDeleted(passportMetadata));
        break;
      case "did":
        setIsOwner(await didRegistry.isOwner(passportMetadata));
        setIsDeleted(await didRegistry.isDeleted(passportMetadata));
        break;
      default:
        throw new Error(`Invalid passport metadata type: ${type}`);
    }
  }, [passportMetadata, didRegistry, nftRegistry]);

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

  return (
    <>
      <PassportCard
        passportData={currentPassport}
        handleUpdate={isOwner ? handleUpdate : undefined}
        handleDelete={isOwner ? handleDelete : undefined}
        isDeleted={isDeleted}
      />
      <PassportHistory passportHistory={passportHistory} />
    </>
  );
}
