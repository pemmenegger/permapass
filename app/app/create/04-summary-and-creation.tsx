import { Button, View, Text } from "react-native";
import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { api } from "../../lib/web-api";
import { walletClient, hardhat } from "../../lib/blockchain/wagmi";
import { nftRegistry } from "../../lib/blockchain/nftRegistry";
import { didRegistry } from "../../lib/blockchain/didRegistry";
import { PermaPassNFTRegistry } from "../../contracts/PermaPassNFTRegistry";
import { fromArweaveTxidToPassportMetadataURL } from "../../lib/utils";
import QRCode from "react-native-qrcode-svg";
import { PermaPassDIDRegistry } from "../../contracts/PermaPassDIDRegistry";

export default function Page() {
  const { state } = useCreation();
  const [urlToEncode, setUrlToEncode] = useState<string | undefined>();
  const [creationProgress, setCreationProgress] = useState<string[]>([]);

  const addCreationProgress = (step: string) => {
    setCreationProgress((creationProgress) => [...creationProgress, step]);
  };

  const handlePassportDataUpload = async () => {
    if (!state.userInput.passportData) {
      console.log("handlePassportDataUpload - No passport data to upload");
      throw new Error("No passport data to upload");
    }
    addCreationProgress("Uploading passport data to Arweave...");
    const txid = await api.arweave.uploadPassport(state.userInput.passportData);
    const uri = api.arweave.fromTxidToURI(txid);
    addCreationProgress("Passport data uploaded to Arweave");
    return uri;
  };

  const handleNFTCreation = async (passportDataURI: string) => {
    addCreationProgress("Creating NFT...");
    const to = walletClient.account.address;
    const tokenId = await nftRegistry.createNFT(to, passportDataURI as string);
    console.log("handleNFTCreation - Token ID:", tokenId);
    const arweaveTxid = await api.arweave.uploadNFTPassportMetadata({
      type: "nft",
      chainId: hardhat.id,
      address: PermaPassNFTRegistry[hardhat.id].address,
      tokenId: tokenId,
    });
    console.log("handleNFTCreation - arweaveTxid", arweaveTxid);
    const passportMetadataURL = fromArweaveTxidToPassportMetadataURL(arweaveTxid);
    console.log("handleNFTCreation - passportMetadataURL", passportMetadataURL);
    addCreationProgress("NFT created");
    return passportMetadataURL;
  };

  const handleDIDCreation = async (passportDataURI: string) => {
    addCreationProgress("Creating DID...");
    const did = await didRegistry.createDID();
    console.log("DID created:", did);
    addCreationProgress("Adding Service to DID...");
    await didRegistry.updateDIDService(did, passportDataURI);
    const arweaveTxid = await api.arweave.uploadDIDPassportMetadata({
      type: "did",
      chainId: hardhat.id,
      address: PermaPassDIDRegistry[hardhat.id].address,
      did: did,
      serviceType: "LinkedDomains",
    });
    const passportMetadataURL = fromArweaveTxidToPassportMetadataURL(arweaveTxid);
    addCreationProgress(`DID ${did} created`);
    return passportMetadataURL;
  };

  const handleCreation = async () => {
    try {
      const passportDataURI = await handlePassportDataUpload();
      console.log("Passport data uploaded to", passportDataURI);

      switch (state.userInput.digitalIdentifier) {
        case "nft": {
          const passportMetadataURL = await handleNFTCreation(passportDataURI);
          setUrlToEncode(passportMetadataURL);
          console.log("Passport Metadata URL:", passportMetadataURL);
          break;
        }
        case "did":
          const passportMetadataURL = await handleDIDCreation(passportDataURI);
          setUrlToEncode(passportMetadataURL);
          console.log("Passport Metadata URL:", passportMetadataURL);
          break;
        default:
          throw new Error("Unsupported digital identifier type");
      }

      if (state.userInput.dataCarrier == "qr") {
        addCreationProgress("Creating QR Code...");
      }
    } catch (error) {
      console.error("Error while creating passport", error);
      addCreationProgress(`Error while creating passport`);
    }
  };

  return (
    <View>
      <Text>We will create the passport with the following properties:</Text>
      <Text>Name: {state.userInput.passportData?.name}</Text>
      <Text>Condition: {state.userInput.passportData?.condition}</Text>
      <Text>Data Carrier: {state.userInput.dataCarrier}</Text>
      <Text>Digital Identifier: {state.userInput.digitalIdentifier}</Text>
      <Button title="Create" onPress={handleCreation} />
      {creationProgress.length > 0 && (
        <>
          <Text>Creation Progress:</Text>
          {creationProgress.map((step, i) => (
            <Text key={i}>{step}</Text>
          ))}
        </>
      )}
      {urlToEncode && state.userInput.dataCarrier == "qr" && <QRCode value={urlToEncode} size={200} />}
      {urlToEncode && <Text>urlToEncode: {urlToEncode}</Text>}
    </View>
  );
}
