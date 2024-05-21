import { TextInput, View, StyleSheet } from "react-native";
import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { router } from "expo-router";
import StepFooter from "../../components/stepper/StepFooter";
import StepTitle from "../../components/stepper/StepTitle";
import StepSubtitle from "../../components/stepper/StepSubtitle";

export default function Page() {
  const { state, dispatch } = useCreation();
  const [name, setName] = useState<string>(state.userInput.passportData?.name || "");
  const [condition, setCondition] = useState<string>(state.userInput.passportData?.condition || "");

  const isInvalid = !name || !condition;

  const handleNext = async () => {
    dispatch({
      type: "PASSPORT_DATA_CHANGED",
      passportData: { name, condition },
    });
    router.push("/create/02-select-data-carrier");
  };
  return (
    <View style={styles.container}>
      <View>
        <StepTitle text="First, set your passport data." highlight="passport data" />
        <StepSubtitle text="Passports contain information that supports the adoption of circular economy practices." />
        <TextInput
          placeholder="Product Name"
          value={name}
          onChangeText={setName}
          maxLength={16}
          autoCapitalize="none"
          // autoFocus={true}
          style={styles.input}
        />
        <TextInput
          placeholder="Product Condition"
          value={condition}
          onChangeText={setCondition}
          maxLength={16}
          autoCapitalize="none"
          style={styles.input}
        />
      </View>
      <StepFooter handleNext={handleNext} isInvalid={isInvalid} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  input: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
});
