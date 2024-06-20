import { View, StyleSheet } from "react-native";
import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { DataCarrier } from "../../types";
import { router } from "expo-router";
import StepOption from "../../components/creation/StepOption";
import Title from "../../components/ui/Title";
import Subtitle from "../../components/ui/Subtitle";
import { PrimaryButton } from "../../components/ui/buttons";

export default function Page() {
  const { state, dispatch } = useCreation();
  const [dataCarrier, setDataCarrier] = useState<DataCarrier | undefined>(state.userInput.dataCarrier);

  const isInvalid = !dataCarrier;

  const handleNext = async () => {
    dispatch({ type: "USER_INPUT_CHANGED", dataCarrier: dataCarrier! });
    router.push("/create/03-select-digital-identifier");
  };

  return (
    <View style={styles.container}>
      <View>
        <Title text="Next, select your data carrier." highlight="data carrier" />
        <Subtitle text="Attaching a data carrier to the construction product allows passports to be easily read via smartphones." />
        <StepOption
          title="QR Code"
          subtitle="A QR Code will be created that links to the digital identifier where the passport data can be retrieved."
          isSelected={dataCarrier == "qr"}
          onPress={() => setDataCarrier("qr")}
        />
        <StepOption
          title="HaLo NFC Chip"
          subtitle="Use a HaLo NFC Chip to link to the digital identifier where the passport data can be retrieved."
          isSelected={dataCarrier == "nfc"}
          onPress={() => setDataCarrier("nfc")}
        />
      </View>
      <PrimaryButton title="Continue" onPress={handleNext} disabled={isInvalid} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
