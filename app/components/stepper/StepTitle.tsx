import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { commonColors, commonStyles } from "../../styles";

interface StepTitleProps {
  text: string;
  highlight: string;
}

export default function StepTitle({ text, highlight }: StepTitleProps) {
  const parts = text.split(highlight);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {parts[0]}
        <Text style={styles.highlight}>{highlight}</Text>
        {parts[1]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  text: {
    ...commonStyles.title,
  },
  highlight: {
    color: commonColors.primary,
  },
});
