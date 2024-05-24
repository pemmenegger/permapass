import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useCreation } from "../../context/CreationContext";
import StepTitle from "../../components/stepper/StepTitle";
import StepSubtitle from "../../components/stepper/StepSubtitle";
import { PrimaryButton } from "../../components/ui/buttons";
import StepOverview from "../../components/stepper/StepOverview";
import { useWalletClient } from "wagmi";
import { DataCarrierType, DigitalIdentifierType } from "../../types";
import { CreateDIDStep, CreateNFTStep, CreatePBTStep } from "../../components/steps/digital-identifiers";
import { GenerateQRCodeStep, WriteHaLoChipStep } from "../../components/steps/data-carriers";
import { UploadPassportDataStep } from "../../components/steps/UploadPassportDataStep";
import { router } from "expo-router";

export default function Page() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const { state, dispatch } = useCreation();

  useEffect(() => {
    dispatch({ type: "RESET" });
  }, []);

  useEffect(() => {
    if (!walletClient) {
      dispatch({ type: "REQUIREMENT_NOT_MET", requirementNotMetMessage: "You must first connect to your wallet" });
      return;
    }
    dispatch({ type: "REQUIREMENT_NOT_MET", requirementNotMetMessage: undefined });
  }, [walletClient, isError, isLoading]);

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
        return WriteHaLoChipStep();
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
        <Text style={{ textAlign: "center" }}>{state.requirementNotMetMessage}</Text>
      ) : (
        <>
          {!state.status && (
            <PrimaryButton
              title="Create"
              onPress={() => dispatch({ type: "CREATION_STATUS_CHANGED", status: "CREATION_STARTED" })}
            />
          )}
          {state.status === "CREATION_DONE" && (
            <PrimaryButton
              title="Finish"
              onPress={() => {
                dispatch({ type: "RESET" });
                router.push({
                  pathname: "/create/05-success",
                  params: {
                    qrCodeURL: state.userInput.dataCarrier === "qr" ? state.results.dataCarrierURL! : undefined,
                  },
                });
              }}
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
