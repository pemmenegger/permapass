import React, { useState } from "react";
import { Button, View, Text, StyleSheet } from "react-native";
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

      <View style={styles.steps}>
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepText}>
            <Text style={styles.stepTitle}>Uploading passport data</Text>
            <Text style={styles.stepDescription}>
              Passport data will be uploaded to <Text style={styles.link}>Arweave</Text>, where it will be permanently
              stored.
            </Text>
          </View>
        </View>
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepText}>
            <Text style={styles.stepTitle}>Creating NFT as digital identifier</Text>
            <Text style={styles.stepDescription}>
              An NFT will be minted on the <Text style={styles.link}>Sepolia Blockchain</Text> and will permanently
              exist there.
            </Text>
          </View>
        </View>
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepText}>
            <Text style={styles.stepTitle}>Generating QR Code as data carrier</Text>
            <Text style={styles.stepDescription}>
              A QR Code linking to the digital identifier and passport data will be generated.
            </Text>
          </View>
        </View>
      </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FA",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: {
    fontSize: 16,
    color: "#000",
  },
  walletButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2ECC71",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  walletButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  content: {
    marginTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  highlight: {
    color: "#2ECC71",
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginTop: 8,
  },
  steps: {
    marginTop: 24,
  },
  step: {
    flexDirection: "row",
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D8D8D8",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepText: {
    marginLeft: 16,
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  stepDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  link: {
    color: "#2ECC71",
    textDecorationLine: "underline",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
  },
  buttonBack: {
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonCreate: {
    backgroundColor: "#000",
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
