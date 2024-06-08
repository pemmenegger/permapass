import { View, StyleSheet } from "react-native";
import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { router } from "expo-router";
import StepTitle from "../../components/stepper/StepTitle";
import StepSubtitle from "../../components/stepper/StepSubtitle";
import { PrimaryButton, SecondaryButton } from "../../components/ui/buttons";
import { PassportCreate } from "../../types";
import PassportCard from "../../components/PassportCard";
import { pickPassportJSON } from "../../lib/utils";

export default function Page() {
  const { state, dispatch } = useCreation();
  const [passportData, setPassportData] = useState<PassportCreate | undefined>(
    state.userInput.passportData || undefined
  );

  const isInvalid = !passportData;

  const handleNext = async () => {
    dispatch({
      type: "USER_INPUT_CHANGED",
      passportData,
    });
    router.push("/create/02-select-data-carrier");
  };

  const handlePassportDataChange = async () => {
    const passportData = await pickPassportJSON();
    if (!passportData) {
      return;
    }
    setPassportData(passportData);
  };

  return (
    <View style={styles.container}>
      <View>
        <StepTitle text="First, set your passport data." highlight="passport data" />
        <StepSubtitle text="Passports contain information that supports the adoption of circular economy practices." />
        {passportData && (
          <View style={{ marginBottom: 16 }}>
            <PassportCard passportData={passportData} />
          </View>
        )}
        <View style={{ marginBottom: 16 }}>
          <SecondaryButton title="Upload JSON" onPress={handlePassportDataChange} />
        </View>
      </View>
      <PrimaryButton title="Continue" onPress={handleNext} disabled={isInvalid} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 16,
  },
});
