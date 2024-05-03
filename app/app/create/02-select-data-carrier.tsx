import { Button, StyleSheet, TextInput, View, Text, TouchableOpacity } from "react-native";
import { defaultStyles } from "../../styles";
import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { DataCarrierType, PassportCreate } from "../../types";
import { router } from "expo-router";

export default function Page() {
  const { state, dispatch } = useCreation();
  const [dataCarrier, setDataCarrier] = useState<DataCarrierType | undefined>(state.userInput.dataCarrier);

  async function onNext() {
    dispatch({ type: "DATA_CARRIER_CHANGED", dataCarrier: dataCarrier! });
    router.push("/create/03-select-digital-identifier");
  }

  return (
    <View>
      <Text>Now, select your data carrier:</Text>
      <TouchableOpacity
        style={dataCarrier == "qr" ? styles.buttonSelected : styles.buttonUnselected}
        onPress={() => setDataCarrier("qr")}
      >
        <Text style={styles.buttonText}>QR Code</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={dataCarrier == "nfc" ? styles.buttonSelected : styles.buttonUnselected}
        onPress={() => setDataCarrier("nfc")}
      >
        <Text style={styles.buttonText}>HaLo NFC Chip</Text>
      </TouchableOpacity>
      <Button title="Back" onPress={router.back} />
      <Button title="Next" onPress={onNext} disabled={dataCarrier == undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonUnselected: {
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    width: 200,
    height: 50,
    marginVertical: 5,
    backgroundColor: defaultStyles.bgLight,
    shadowOffset: { width: 3, height: 3 },
    shadowColor: defaultStyles.bgDark,
    shadowRadius: 5,
    shadowOpacity: 0.2,
    borderRadius: 10,
  },
  buttonSelected: {
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    width: 200,
    height: 50,
    marginVertical: 5,
    backgroundColor: defaultStyles.secondary,
    shadowOffset: { width: 3, height: 3 },
    shadowColor: defaultStyles.bgDark,
    shadowRadius: 5,
    shadowOpacity: 0.2,
    borderRadius: 10,
  },
  buttonText: {
    color: defaultStyles.secondary,
    fontSize: defaultStyles.fontMedium,
    fontWeight: "bold",
  },
});
