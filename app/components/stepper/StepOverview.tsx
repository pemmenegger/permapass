import { View, Text, StyleSheet } from "react-native";
import { commonColors, commonStyles } from "../../styles";
import { LoadingSpinnerIcon } from "../icons/LoadingSpinnerIcon";
import { CheckCircleIcon } from "../icons/CheckCircleIcon";
import React from "react";

interface StepProps {
  title: string;
  description: React.ReactNode;
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {step.isLoading && (
                <View style={{ marginRight: 8 }}>
                  <LoadingSpinnerIcon height={16} color={commonColors.gray} strokeWidth={2.3} />
                </View>
              )}
              {step.isCompleted && (
                <View style={{ marginRight: 8 }}>
                  <CheckCircleIcon height={16} color={commonColors.primary} strokeWidth={2} />
                </View>
              )}
              <Text style={styles.stepDescription}>{step.description}</Text>
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
  stepDescription: {
    ...commonStyles.h4,
    marginTop: 4,
  },
});
