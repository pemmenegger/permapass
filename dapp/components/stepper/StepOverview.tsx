import { View, Text, StyleSheet } from "react-native";
import { commonColors, commonStyles } from "../../styles";
import React from "react";
import LoadingText from "../LoadingText";

interface StepProps {
  title: string;
  description: string | React.ReactNode;
  isLoading: boolean;
  isCompleted: boolean;
}

interface StepOverviewProps {
  steps: StepProps[];
}

export default function StepOverview({ steps }: StepOverviewProps) {
  return (
    <View style={styles.steps}>
      {steps.map((step, index) => (
        <View style={styles.step} key={index}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.stepText}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <View style={{ marginTop: 4 }}>
              <LoadingText isLoading={step.isLoading} isCompleted={step.isCompleted} text={step.description} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  steps: {
    marginTop: 24,
  },
  step: {
    flexDirection: "row",
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: commonColors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  stepNumberText: {
    ...commonStyles.p,
    fontFamily: "Inter-SemiBold",
  },
  stepText: {
    marginTop: 4,
    marginLeft: 16,
    flex: 1,
  },
  stepTitle: {
    ...commonStyles.p,
    fontFamily: "Inter-SemiBold",
  },
});
