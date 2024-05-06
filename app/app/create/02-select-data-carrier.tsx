import { Button, View, Text } from "react-native";
import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { DataCarrierType } from "../../types";
import { router } from "expo-router";
import OptionCard from "../../components/OptionCard";

export default function Page() {
  const { state, dispatch } = useCreation();
  const [dataCarrier, setDataCarrier] = useState<DataCarrierType | undefined>(state.userInput.dataCarrier);

  const isInvalid = !dataCarrier;

  const handleNext = async () => {
    dispatch({ type: "DATA_CARRIER_CHANGED", dataCarrier: dataCarrier! });
    router.push("/create/03-select-digital-identifier");
  };

  return (
    <View>
      <Text>Now, select your data carrier:</Text>
      <OptionCard text="QR Code" isSelected={dataCarrier == "qr"} onPress={() => setDataCarrier("qr")} />
      <OptionCard text="HaLo NFC Chip" isSelected={dataCarrier == "nfc"} onPress={() => setDataCarrier("nfc")} />
      <Button title="Back" onPress={router.back} />
      <Button title="Next" onPress={handleNext} disabled={isInvalid} />
    </View>
  );
}
