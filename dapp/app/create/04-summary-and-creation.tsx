import React, { useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useCreation } from "../../context/CreationContext";
import Title from "../../components/ui/Title";
import Subtitle from "../../components/ui/Subtitle";
import { PrimaryButton } from "../../components/ui/buttons";
import StepOverview from "../../components/creation/StepOverview";
import { useWalletClient } from "wagmi";
import { DataCarrier, DigitalIdentifier } from "../../types";
import { CreateDIDStep, CreateNFTStep, CreatePBTStep } from "../../components/creation/digital-identifiers";
import { InitQRCodeStep, InitHaLoNFCChipStep } from "../../components/creation/data-carriers";
import { UploadPassportDataStep } from "../../components/creation/UploadPassportDataStep";
import { router } from "expo-router";
import { isSepoliaSwitchRequired } from "../../lib/utils";

export default function Page() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const { state, dispatch } = useCreation();

  useEffect(() => {
    if (!walletClient) {
      dispatch({ type: "REQUIREMENT_NOT_MET", requirementNotMetMessage: "You must first connect to your wallet" });
      return;
    }
    if (isSepoliaSwitchRequired(walletClient)) {
      dispatch({
        type: "REQUIREMENT_NOT_MET",
        requirementNotMetMessage: "You must first switch to the Sepolia network within your wallet app",
      });
      return;
    }
    dispatch({ type: "REQUIREMENT_NOT_MET", requirementNotMetMessage: undefined });
  }, [walletClient, isError, isLoading]);

  useEffect(() => {
    if (state.errorMessage) {
      Alert.alert(`An error occurred. ${state.errorMessage}`);
    }
  }, [state.errorMessage]);

  const getDigitalIdentityStep = (type: DigitalIdentifier) => {
    switch (type) {
      case "nft":
        return CreateNFTStep();
      case "pbt":
        return CreatePBTStep();
      case "did":
        return CreateDIDStep();
      default:
        throw new Error(`Invalid digital identifier type: ${type}`);
    }
  };

  const getDataCarrierStep = (type: DataCarrier) => {
    switch (type) {
      case "nfc":
        return InitHaLoNFCChipStep();
      case "qr":
        return InitQRCodeStep();
      default:
        throw new Error("Invalid data carrier type");
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Title text="Finally, create your passport." highlight="passport" />
        <Subtitle text="Given your configuration, the passport is now ready to be created. Upon creation the following steps will be executed:" />
        <StepOverview
          steps={[
            UploadPassportDataStep(),
            getDigitalIdentityStep(state.userInput.digitalIdentifier!),
            getDataCarrierStep(state.userInput.dataCarrier!),
          ]}
        />
      </View>
      {state.requirementNotMetMessage ? (
        <Text style={{ textAlign: "center" }}>{state.requirementNotMetMessage}</Text>
      ) : (
        <>
          {!state.status && <PrimaryButton title="Create" onPress={() => dispatch({ type: "CREATION_STARTED" })} />}
          {state.status === "DATA_CARRIER_INITIALIZED" && (
            <PrimaryButton
              title="Finish"
              onPress={() => {
                router.push("/create/05-success");
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
