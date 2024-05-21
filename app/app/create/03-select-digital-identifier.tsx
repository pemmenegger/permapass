import { View, StyleSheet } from "react-native";
import { useState } from "react";
import { useCreation } from "../../context/CreationContext";
import { DigitalIdentifierType } from "../../types";
import { router } from "expo-router";
import StepOption from "../../components/stepper/StepOption";
import StepFooter from "../../components/stepper/StepFooter";
import StepTitle from "../../components/stepper/StepTitle";
import StepSubtitle from "../../components/stepper/StepSubtitle";

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
    <View style={styles.container}>
      <View>
        <StepTitle text="Now, pick a digital identifier." highlight="digital identifier" />
        <StepSubtitle text="By assigning a construction product to a digital identifier, we can link it to its previously created passport data." />
        <StepOption
          title="Non-Fungible Token"
          subtitle="Non-Fungible Tokens (NFTs) are unique digital assets on a blockchain."
          isSelected={digitalIdentifier == "nft"}
          onPress={() => setDigitalIdentifier("nft")}
        />
        <StepOption
          title="Decentralized Identifier"
          subtitle="Decentralized Identifiers (DIDs) are digital identifiers that enable verifiable, self-sovereign identity without a centralized authority."
          isSelected={digitalIdentifier == "did"}
          onPress={() => setDigitalIdentifier("did")}
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
});
