import React, { useState } from "react";
import { Button, View, Text, StyleSheet } from "react-native";
import { useCreation } from "../../context/CreationContext";
import { api } from "../../lib/web-api";
import { encodeDataCarrierURL } from "../../lib/utils";
import QRCode from "react-native-qrcode-svg";
import { useNFTRegistry } from "../../hooks/blockchain/useNFTRegistry";
import { useDIDRegistry } from "../../hooks/blockchain/useDIDRegistry";
import { ArweaveURI } from "../../types";
import StepTitle from "../../components/stepper/StepTitle";
import StepSubtitle from "../../components/stepper/StepSubtitle";
import StepFooter from "../../components/stepper/StepFooter";
import { commonColors, commonStyles } from "../../styles";
import { usePBTRegistry } from "../../hooks/blockchain/usePBTRegistry";
import { useHaLoNFCChip } from "../../hooks/useHaloNFCChip";
import { useModal } from "../../context/InfoModalContext";
import InfoButton from "../../components/ui/InfoButton";

export default function Page() {
  const { didRegistry } = useDIDRegistry();
  const { nftRegistry } = useNFTRegistry();
  const { pbtRegistry } = usePBTRegistry();
  const { haloNFCChip } = useHaLoNFCChip();
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
    const metadataURI = await api.arweave.uploadPassportMetadata(passportMetadata);
    const dataCarrierURL = encodeDataCarrierURL(metadataURI);
    addCreationProgress("NFT created");
    return dataCarrierURL;
  };

  const handlePBTCreation = async (passportURI: ArweaveURI): Promise<string> => {
    if (!pbtRegistry.createPBT) {
      console.error("createPBT not available");
      throw new Error("createPBT not available");
    }

    if (!haloNFCChip.computeSignatureFromChip) {
      console.error("computeSignatureFromChip not available");
      throw new Error("computeSignatureFromChip not available");
    }

    addCreationProgress("Computing signature from chip...");
    const result = await haloNFCChip.computeSignatureFromChip();
    if (!result) {
      console.error("Failed to compute signature from chip");
      throw new Error("Failed to compute signature from chip");
    }
    const { chipAddress, signatureFromChip, blockNumberUsedInSig } = result;

    addCreationProgress("Creating PBT...");
    const passportMetadata = await pbtRegistry.createPBT(
      chipAddress,
      signatureFromChip,
      blockNumberUsedInSig,
      passportURI
    );
    const metadataURI = await api.arweave.uploadPassportMetadata(passportMetadata);
    const dataCarrierURL = encodeDataCarrierURL(metadataURI);
    addCreationProgress("PBT created");
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
    const metadataURI = await api.arweave.uploadPassportMetadata(passportMetadata);
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
        case "pbt":
          dataCarrierURL = await handlePBTCreation(passportDataURI);
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
    <View style={styles.container}>
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
                Passport data will be uploaded to{" "}
                <InfoButton
                  label="Arweave"
                  description="Arweave is a decentralized storage network that enables permanent storage of data."
                />
                , where it will be permanently stored.
              </Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>
                Creating {state.userInput.digitalIdentifier?.toUpperCase()} as digital identifier
              </Text>
              <Text style={styles.stepDescription}>
                An NFT will be minted on the{" "}
                <InfoButton
                  label="Sepolia Blockchain"
                  description="Sepolia is a decentralized blockchain network that enables the minting of NFTs. Currently, only Sepolia is supported."
                />{" "}
                and will permanently exist there.
              </Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>
                {state.userInput.dataCarrier == "qr"
                  ? "Generating QR Code as data carrier"
                  : "Setting up HaLo NFC Chip as data carrier"}
              </Text>
              <Text style={styles.stepDescription}>
                {state.userInput.dataCarrier == "qr"
                  ? "A QR Code linking to the digital identifier and passport data will be generated."
                  : "The HaLo NFC Chip will be programmed with the digital identifier that links to the passport data."}
              </Text>
            </View>
          </View>
        </View>
      </View>
      {/* <StepFooter handleNext={handleCreation} isInvalid={false} /> */}

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
    justifyContent: "space-between",
  },
  steps: {
    marginTop: 24,
  },
  step: {
    flexDirection: "row",
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: commonColors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  stepNumberText: {
    ...commonStyles.p,
    fontFamily: "Inter-SemiBold",
  },
  stepText: {
    marginTop: 4,
    marginLeft: 16,
    flex: 1,
  },
  stepTitle: {
    ...commonStyles.p,
    fontFamily: "Inter-SemiBold",
  },
  stepDescription: {
    ...commonStyles.h4,
    marginTop: 4,
  },
});
