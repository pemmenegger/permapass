import React from "react";
import { Button, View, StyleSheet } from "react-native";
import { router } from "expo-router";

interface StepperFooterProps {
  handleNext: () => void;
  isInvalid: boolean;
}

export default function StepperFooter({ handleNext, isInvalid }: StepperFooterProps) {
  return (
    <View style={styles.container}>
      <Button title="Back" onPress={router.back} />
      <Button title="Next" onPress={handleNext} disabled={isInvalid} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
  },
});
