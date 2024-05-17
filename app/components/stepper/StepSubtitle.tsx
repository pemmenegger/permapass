import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { commonStyles } from "../../styles";

interface StepSubtitleProps {
  text: string;
}

export default function StepSubtitle({ text }: StepSubtitleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  text: {
    ...commonStyles.subtitle,
    fontSize: 18,
  },
});
