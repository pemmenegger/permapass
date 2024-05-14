import { Button, TextInput, View, Text } from "react-native";
import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { router } from "expo-router";
import StepperFooter from "../../components/StepperFooter";

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
      />
      <StepperFooter handleNext={handleNext} isInvalid={isInvalid} />
    </View>
  );
}
