import { Button, StyleSheet, TextInput, View, Text, TouchableOpacity } from "react-native";
import { defaultStyles } from "../../styles";
import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { DataCarrierType, DigitalIdentifierType, PassportCreate } from "../../types";
import { router } from "expo-router";

export default function Page() {
  const { state, dispatch } = useCreation();
  const [digitalIdentifier, setDigitalIdentifier] = useState<DigitalIdentifierType | undefined>(
    state.userInput.digitalIdentifier
  );

  async function onNext() {
    dispatch({ type: "DIGITAL_IDENTIFIER_CHANGED", digitalIdentifier: digitalIdentifier! });
    router.push("/create/04-summary-and-creation");
  }

  return (
    <View>
      <Text>Now, select your data carrier:</Text>
      <TouchableOpacity
        style={digitalIdentifier == "nft" ? styles.buttonSelected : styles.buttonUnselected}
        onPress={() => setDigitalIdentifier("nft")}
      >
        <Text style={styles.buttonText}>NFT</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={digitalIdentifier == "did" ? styles.buttonSelected : styles.buttonUnselected}
        onPress={() => setDigitalIdentifier("did")}
      >
        <Text style={styles.buttonText}>DID</Text>
      </TouchableOpacity>
      <Button title="Back" onPress={router.back} />
      <Button title="Next" onPress={onNext} disabled={digitalIdentifier == undefined} />
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
