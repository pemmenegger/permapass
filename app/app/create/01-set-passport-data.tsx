import { Button, StyleSheet, TextInput, View, Text } from "react-native";
import { defaultStyles } from "../../styles";
import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { PassportCreate } from "../../types";
import { router } from "expo-router";

export default function Page() {
  const { state, dispatch } = useCreation();
  const [name, setName] = useState<string>(state.userInput.passportData?.name || "");
  const [condition, setCondition] = useState<string>(state.userInput.passportData?.condition || "good");

  async function onNext() {
    dispatch({
      type: "PASSPORT_DATA_CHANGED",
      passportData: {
        name: name,
        condition: condition,
      },
    });
    router.push("/create/02-select-data-carrier");
  }

  return (
    <View>
      <Text>First, fill in passport data:</Text>
      <TextInput
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
        maxLength={16}
        autoCapitalize="none"
        autoFocus={true}
      />
      <TextInput
        placeholder="Product Condition"
        value={condition}
        onChangeText={setCondition}
        maxLength={16}
        autoCapitalize="none"
        autoFocus={true}
      />
      <Button title="Back" onPress={router.back} />
      <Button title="Next" onPress={onNext} />
    </View>
  );
}
