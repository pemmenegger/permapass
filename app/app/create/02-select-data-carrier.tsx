import { View, StyleSheet } from "react-native";
import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { DataCarrierType } from "../../types";
import { router } from "expo-router";
import StepOption from "../../components/stepper/StepOption";
import StepTitle from "../../components/stepper/StepTitle";
import StepSubtitle from "../../components/stepper/StepSubtitle";
import DefaultButton from "../../components/ui/DefaultButton";

export default function Page() {
  const { state, dispatch } = useCreation();
  const [dataCarrier, setDataCarrier] = useState<DataCarrierType | undefined>(state.userInput.dataCarrier);

  const isInvalid = !dataCarrier;

  const handleNext = async () => {
    dispatch({ type: "DATA_CARRIER_CHANGED", dataCarrier: dataCarrier! });
    router.push("/create/03-select-digital-identifier");
  };

  return (
    <View style={styles.container}>
      <View>
        <StepTitle text="Next, select your data carrier." highlight="data carrier" />
        <StepSubtitle text="Attaching a data carrier to the construction product allows passports to be easily read via smartphones." />
        <StepOption
          title="QR Code"
          subtitle="A QR Code will be created that links to the digital identifier where the passport data can be retrieved."
          isSelected={dataCarrier == "qr"}
          onPress={() => setDataCarrier("qr")}
        />
        <StepOption
          title="HaLo NFC Chip"
          subtitle="If you have HaLo NFC Chips available, you can write the "
          isSelected={dataCarrier == "nfc"}
          onPress={() => setDataCarrier("nfc")}
        />
      </View>
      <DefaultButton type="primary" text="Continue" onPress={handleNext} disabled={isInvalid} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
