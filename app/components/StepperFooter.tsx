import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import DefaultButton from "./DefaultButton";
import { defaultStyles } from "../styles";

interface StepperFooterProps {
  handleNext: () => void;
  isInvalid: boolean;
}

export default function StepperFooter({ handleNext, isInvalid }: StepperFooterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftButtonContainer}>
        <DefaultButton type="secondary" text="Back" onPress={router.back} />
      </View>
      <View style={styles.rightButtonContainer}>
        <DefaultButton type="primary" text="Next" onPress={handleNext} disabled={isInvalid} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  leftButtonContainer: {
    flex: 1,
    marginRight: defaultStyles.marginHorizontal / 2,
  },
  rightButtonContainer: {
    flex: 1,
    marginLeft: defaultStyles.marginHorizontal / 2,
  },
});
