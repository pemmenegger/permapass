import { View, Text } from "react-native";
import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { DigitalIdentifierType } from "../../types";
import { router } from "expo-router";
import OptionCard from "../../components/OptionCard";
import StepperFooter from "../../components/StepperFooter";

export default function Page() {
  const { state, dispatch } = useCreation();
  const [digitalIdentifier, setDigitalIdentifier] = useState<DigitalIdentifierType | undefined>(
    state.userInput.digitalIdentifier
  );

  const isInvalid = !digitalIdentifier;

  const handleNext = async () => {
    dispatch({ type: "DIGITAL_IDENTIFIER_CHANGED", digitalIdentifier: digitalIdentifier! });
    router.push("/create/04-summary-and-creation");
  };

  return (
    <View>
      <Text>Now, select your data carrier:</Text>
      <OptionCard text="NFT" isSelected={digitalIdentifier == "nft"} onPress={() => setDigitalIdentifier("nft")} />
      <OptionCard text="DID" isSelected={digitalIdentifier == "did"} onPress={() => setDigitalIdentifier("did")} />
      <StepperFooter handleNext={handleNext} isInvalid={isInvalid} />
    </View>
  );
}
