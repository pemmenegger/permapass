import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useCreation } from "../../context/CreationContext";
import { api } from "../../lib/web-api";
import { encodeDataCarrierURL } from "../../lib/utils";
import StepTitle from "../../components/stepper/StepTitle";
import StepSubtitle from "../../components/stepper/StepSubtitle";
import { useHaLoNFCChip } from "../../hooks/useHaloNFCChip";
import DefaultButton from "../../components/ui/DefaultButton";
import StepOverview from "../../components/stepper/StepOverview";
import { useWalletClient } from "wagmi";
import {
  CreateDIDStep,
  CreateNFTStep,
  CreatePBTStep,
  GenerateQRCodeStep,
  UploadPassportDataStep,
} from "../../components/steps";
import { useContracts } from "../../hooks/blockchain/useContracts";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { DataCarrierType, DigitalIdentifierType } from "../../types";

export default function Page() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const { didRegistry, nftRegistry, pbtRegistry } = useContracts();
  const { haloNFCChip } = useHaLoNFCChip();
  const { state, dispatch } = useCreation();

  useEffect(() => {
    if (!walletClient) {
      dispatch({ type: "REQUIREMENT_NOT_MET", requirementNotMetMessage: "You must connect to your wallet first" });
      return;
    }
    dispatch({ type: "REQUIREMENT_NOT_MET", requirementNotMetMessage: undefined });
  }, [walletClient, isError, isLoading]);

  useAsyncEffect(async () => {
    switch (state.status) {
      case "CREATION_STARTED":
        try {
          const passportDataURI = await api.arweave.uploadPassport(state.userInput.passportData!);
          dispatch({ type: "RESULTS_CHANGED", passportDataURI });
          dispatch({ type: "CREATION_STATUS_CHANGED", status: "PASSPORT_DATA_UPLOADED" });
        } catch (error) {
          console.error("Error while uploading passport data", error);
          const errorMessage = "An error occurred while uploading passport data";
          dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage });
        }
        break;
      case "PASSPORT_DATA_UPLOADED":
        if (!state.results.passportDataURI) {
          dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "Passport URI not available" });
          break;
        }
        const passportDataURI = state.results.passportDataURI;

        let passportMetadataURI;
        switch (state.userInput.digitalIdentifier) {
          case "nft":
            const nftPassportMetadata = await nftRegistry.createNFT!(passportDataURI);
            passportMetadataURI = await api.arweave.uploadPassportMetadata(nftPassportMetadata);
            break;
          case "pbt":
            const result = await haloNFCChip.computeSignatureFromChip!();
            if (!result) {
              dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "Failed to compute signature from chip" });
              break;
            }
            const { chipAddress, signatureFromChip, blockNumberUsedInSig } = result;

            const pbtPassportMetadata = await pbtRegistry.createPBT!(
              chipAddress,
              signatureFromChip,
              blockNumberUsedInSig,
              passportDataURI
            );
            passportMetadataURI = await api.arweave.uploadPassportMetadata(pbtPassportMetadata);
            break;
          case "did":
            const didPassportMetadata = await didRegistry.createDID!();
            await didRegistry.addDIDService!(didPassportMetadata.did, passportDataURI);
            passportMetadataURI = await api.arweave.uploadPassportMetadata(didPassportMetadata);
            break;
          default:
            break;
        }

        if (!passportMetadataURI) {
          dispatch({ type: "CREATION_ERROR_OCCURRED", errorMessage: "Passport metadata URI not available" });
          break;
        }
        const dataCarrierURL = encodeDataCarrierURL(passportMetadataURI);

        dispatch({ type: "RESULTS_CHANGED", dataCarrierURL });
        dispatch({ type: "CREATION_STATUS_CHANGED", status: "DIGITAL_IDENTIFIER_CREATED" });
        break;
      default:
        break;
    }
  }, [state]);

  const getDigitalIdentityStep = (type: DigitalIdentifierType) => {
    switch (type) {
      case "nft":
        return CreateNFTStep();
      case "pbt":
        return CreatePBTStep();
      case "did":
        return CreateDIDStep();
      default:
        throw new Error("Invalid data carrier type");
    }
  };

  const getDataCarrierStep = (type: DataCarrierType) => {
    switch (type) {
      case "nfc":
        return GenerateQRCodeStep();
      case "qr":
        return GenerateQRCodeStep();
      default:
        throw new Error("Invalid data carrier type");
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <StepTitle text="Finally, create your passport." highlight="passport" />
        <StepSubtitle text="Given your configuration, the passport is now ready to be created. Upon creation the following steps will be executed:" />
        <StepOverview
          steps={[
            UploadPassportDataStep(),
            getDigitalIdentityStep(state.userInput.digitalIdentifier!),
            getDataCarrierStep(state.userInput.dataCarrier!),
          ]}
        />
      </View>
      {state.errorMessage && <Text>{state.errorMessage}</Text>}
      {state.requirementNotMetMessage ? (
        <Text>{state.requirementNotMetMessage}</Text>
      ) : (
        <>
          {!state.status && (
            <DefaultButton
              type="primary"
              text="Create"
              onPress={() => dispatch({ type: "CREATION_STATUS_CHANGED", status: "CREATION_STARTED" })}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
