import { Button, StyleSheet, TextInput, View, Text, TouchableOpacity } from "react-native";
import { defaultStyles } from "../../styles";
import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { DataCarrierType, DigitalIdentifierType, PassportCreate } from "../../types";
import { router } from "expo-router";

export default function Page() {
  const { state } = useCreation();

  return (
    <View>
      <Text>We will create the passport with the following properties:</Text>
      <Text>Name: {state.userInput.passportData?.name}</Text>
      <Text>Condition: {state.userInput.passportData?.condition}</Text>
      <Text>Data Carrier: {state.userInput.dataCarrier}</Text>
      <Text>Digital Identifier: {state.userInput.digitalIdentifier}</Text>
    </View>
  );
}
