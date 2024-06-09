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
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {isLoading && (
        <View style={{ marginRight: 8 }}>
          <LoadingSpinnerIcon height={16} color={commonColors.gray} strokeWidth={2.3} />
        </View>
      )}
      {isCompleted && (
        <View style={{ marginRight: 8 }}>
          <CheckCircleIcon height={16} color={commonColors.primary} strokeWidth={2} />
        </View>
      )}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    marginRight: 8,
  },
  text: {
    ...commonStyles.h4,
  },
});
