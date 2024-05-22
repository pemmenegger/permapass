import React, { useEffect, useState } from "react";
import { Button, View, Text, StyleSheet } from "react-native";
import { useCreation } from "../../context/CreationContext";
import { api } from "../../lib/web-api";
import { encodeDataCarrierURL } from "../../lib/utils";
import QRCode from "react-native-qrcode-svg";
import { useNFTRegistry } from "../../hooks/blockchain/useNFTRegistry";
import { useDIDRegistry } from "../../hooks/blockchain/useDIDRegistry";
import StepTitle from "../../components/stepper/StepTitle";
import StepSubtitle from "../../components/stepper/StepSubtitle";
import { usePBTRegistry } from "../../hooks/blockchain/usePBTRegistry";
import { useHaLoNFCChip } from "../../hooks/useHaloNFCChip";
import InfoButton from "../../components/ui/InfoButton";
import DefaultButton from "../../components/ui/DefaultButton";
import StepOverview from "../../components/stepper/StepOverview";
import { useWalletClient } from "wagmi";
import { CreateNFTStep, GenerateQRCodeStep, UploadPassportDataStep } from "../../components/steps";

export default function Page() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const { didRegistry } = useDIDRegistry();
  const { nftRegistry } = useNFTRegistry();
  const { pbtRegistry } = usePBTRegistry();
  const { haloNFCChip } = useHaLoNFCChip();
  const { state } = useCreation();
  const [invalidMessage, setInvalidMessage] = useState<string | undefined>();
  const [urlToEncode, setUrlToEncode] = useState<string | undefined>();

  useEffect(() => {
    if (!walletClient) {
      setInvalidMessage("First, connect to your wallet");
    } else if (!state.userInput.passportData) {
      setInvalidMessage("No passport data to upload");
    } else if (!nftRegistry.createNFT) {
      setInvalidMessage("Could not load NFT registry smart contract");
    } else if (!pbtRegistry.createPBT) {
      setInvalidMessage("Could not load PBT registry smart contract");
    } else if (!didRegistry.createDID) {
      setInvalidMessage("Could not load DID registry smart contract");
    } else if (!didRegistry.addDIDService) {
      setInvalidMessage("Could not load DID registry smart contract");
    } else if (!haloNFCChip.computeSignatureFromChip) {
      setInvalidMessage("Could not load HaLo NFC Chip interface");
    }
  }, [
    walletClient,
    state.userInput.passportData,
    nftRegistry,
    pbtRegistry,
    didRegistry,
    haloNFCChip,
    isError,
    isLoading,
  ]);

  const handleCreation = async () => {
    try {
      const passportURI = await api.arweave.uploadPassport(state.userInput.passportData!);
      console.log("Passport data uploaded to", passportURI);

      let dataCarrierURL: string;
      switch (state.userInput.digitalIdentifier) {
        case "nft":
          const nftPassportMetadata = await nftRegistry.createNFT!(passportURI);
          const nftPassportMetadataURI = await api.arweave.uploadPassportMetadata(nftPassportMetadata);
          dataCarrierURL = encodeDataCarrierURL(nftPassportMetadataURI);
          break;
        case "pbt":
          const result = await haloNFCChip.computeSignatureFromChip!();
          if (!result) {
            console.error("Failed to compute signature from chip");
            throw new Error("Failed to compute signature from chip");
          }
          const { chipAddress, signatureFromChip, blockNumberUsedInSig } = result;

          const pbtPassportMetadata = await pbtRegistry.createPBT!(
            chipAddress,
            signatureFromChip,
            blockNumberUsedInSig,
            passportURI
          );
          const pbtPassportMetadataURI = await api.arweave.uploadPassportMetadata(pbtPassportMetadata);
          dataCarrierURL = encodeDataCarrierURL(pbtPassportMetadataURI);
          break;
        case "did":
          const didPassportMetadata = await didRegistry.createDID!();
          await didRegistry.addDIDService!(didPassportMetadata.did, passportURI);
          const didPassportMetadataURI = await api.arweave.uploadPassportMetadata(didPassportMetadata);
          dataCarrierURL = encodeDataCarrierURL(didPassportMetadataURI);
          break;
        default:
          throw new Error("Unsupported digital identifier type");
      }

      setUrlToEncode(dataCarrierURL);
      console.log("dataCarrierURL:", dataCarrierURL);
    } catch (error) {
      console.error("Error while creating passport", error);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <StepTitle text="Finally, create your passport." highlight="passport" />
        <StepSubtitle text="Given your configuration, the passport is now ready to be created. Upon creation the following steps will be executed:" />
        <StepOverview
          steps={[
            UploadPassportDataStep({ isLoading: false, isCompleted: false }),
            CreateNFTStep({ isLoading: false, isCompleted: false }),
            GenerateQRCodeStep({ isLoading: false, isCompleted: false }),
          ]}
        />
      </View>
      {invalidMessage ? (
        <Text>{invalidMessage}</Text>
      ) : (
        <DefaultButton type="primary" text="Create" onPress={handleCreation} />
      )}

      {/* <Button title="Create" onPress={handleCreation} />
      {creationProgress.length > 0 && (
        <>
          <Text>Creation Progress:</Text>
          {creationProgress.map((step, i) => (
            <Text key={i}>{step}</Text>
          ))}
        </>
      )}
      {urlToEncode && state.userInput.dataCarrier === "qr" && <QRCode value={urlToEncode} size={200} />}
      {urlToEncode && <Text>urlToEncode: {urlToEncode}</Text>} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
