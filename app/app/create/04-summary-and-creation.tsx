import React, { useState } from "react";
import { Button, View, Text } from "react-native";
import { useCreation } from "../../context/CreationContext";
import { api } from "../../lib/web-api";
import { encodeDataCarrierURL } from "../../lib/utils";
import QRCode from "react-native-qrcode-svg";
import { useNFTRegistry } from "../../hooks/useNFTRegistry";
import { useDIDRegistry } from "../../hooks/useDIDRegistry";
import { ArweaveURI } from "../../types";
import StepTitle from "../../components/stepper/StepTitle";
import StepSubtitle from "../../components/stepper/StepSubtitle";

export default function Page() {
  const { didRegistry } = useDIDRegistry();
  const { nftRegistry } = useNFTRegistry();
  const { state } = useCreation();
  const [urlToEncode, setUrlToEncode] = useState<string | undefined>();
  const [creationProgress, setCreationProgress] = useState<string[]>([]);

  const addCreationProgress = (step: string) => {
    setCreationProgress((prevProgress) => [...prevProgress, step]);
  };

  const handlePassportDataUpload = async (): Promise<ArweaveURI> => {
    if (!state.userInput.passportData) {
      console.log("No passport data to upload");
      throw new Error("No passport data to upload");
    }

    addCreationProgress("Uploading passport data to Arweave...");
    const passportURI = await api.arweave.uploadPassport(state.userInput.passportData);
    addCreationProgress("Passport data uploaded to Arweave");
    return passportURI;
  };

  const handleNFTCreation = async (passportURI: ArweaveURI): Promise<string> => {
    if (!nftRegistry.createNFT) {
      console.error("createNFT not available");
      throw new Error("createNFT not available");
    }

    addCreationProgress("Creating NFT...");
    const passportMetadata = await nftRegistry.createNFT(passportURI);
    const metadataURI = await api.arweave.uploadNFTPassportMetadata(passportMetadata);
    const dataCarrierURL = encodeDataCarrierURL(metadataURI);
    addCreationProgress("NFT created");
    return dataCarrierURL;
  };

  const handleDIDCreation = async (passportURI: ArweaveURI): Promise<string> => {
    if (!didRegistry.createDID) {
      console.error("createDID not available");
      throw new Error("createDID not available");
    }
    if (!didRegistry.addDIDService) {
      console.error("addDIDService not available");
      throw new Error("addDIDService not available");
    }

    addCreationProgress("Creating DID...");
    const passportMetadata = await didRegistry.createDID();
    addCreationProgress("Adding Service to DID...");
    await didRegistry.addDIDService(passportMetadata.did, passportURI);
    const metadataURI = await api.arweave.uploadDIDPassportMetadata(passportMetadata);
    const dataCarrierURL = encodeDataCarrierURL(metadataURI);
    addCreationProgress(`DID ${passportMetadata.did} created`);
    return dataCarrierURL;
  };

  const handleCreation = async () => {
    try {
      const passportDataURI = await handlePassportDataUpload();
      console.log("Passport data uploaded to", passportDataURI);

      let dataCarrierURL: string;
      switch (state.userInput.digitalIdentifier) {
        case "nft":
          dataCarrierURL = await handleNFTCreation(passportDataURI);
          break;
        case "did":
          dataCarrierURL = await handleDIDCreation(passportDataURI);
          break;
        default:
          throw new Error("Unsupported digital identifier type");
      }

      setUrlToEncode(dataCarrierURL);
      console.log("dataCarrierURL:", dataCarrierURL);

      if (state.userInput.dataCarrier === "qr") {
        addCreationProgress("Creating QR Code...");
      }
    } catch (error) {
      console.error("Error while creating passport", error);
      addCreationProgress("Error while creating passport");
    }
  };

  return (
    <View>
      <StepTitle text="Finally, create your passport." highlight="passport" />
      <StepSubtitle text="Given your configuration, the passport is now ready to be created." />

      <Button title="Create" onPress={handleCreation} />
      {creationProgress.length > 0 && (
        <>
          <Text>Creation Progress:</Text>
          {creationProgress.map((step, i) => (
            <Text key={i}>{step}</Text>
          ))}
        </>
      )}
      {urlToEncode && state.userInput.dataCarrier === "qr" && <QRCode value={urlToEncode} size={200} />}
      {urlToEncode && <Text>urlToEncode: {urlToEncode}</Text>}
    </View>
  );
}
