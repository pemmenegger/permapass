import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { LoadingSpinnerIcon } from "../icons/LoadingSpinnerIcon";
import { CheckCircleIcon } from "../icons/CheckCircleIcon";
import { commonColors, commonStyles } from "../../styles";

interface LoadingTextProps {
  isLoading: boolean;
  isCompleted?: boolean;
  text: string | React.ReactNode;
}

export default function LoadingText({ isLoading, isCompleted, text }: LoadingTextProps) {
  const hasIcon = isLoading || isCompleted;

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.iconWrapper}>
          <LoadingSpinnerIcon height={16} color={commonColors.gray} strokeWidth={2.3} />
        </View>
      )}
      {isCompleted && (
        <View style={styles.iconWrapper}>
          <CheckCircleIcon height={16} color={commonColors.primary} strokeWidth={2} />
        </View>
      )}
      <View style={[styles.textWrapper, hasIcon && styles.textWrapperWithIcon]}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    marginRight: 8,
  },
  textWrapper: {
    flex: 1,
  },
  textWrapperWithIcon: {
    flex: 1,
    marginRight: 10,
  },
  text: {
    ...commonStyles.h4,
  },
});
