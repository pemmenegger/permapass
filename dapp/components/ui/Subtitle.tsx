import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { commonStyles } from "../../styles";

interface SubtitleProps {
  text: string;
}

export default function Subtitle({ text }: SubtitleProps) {
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
    ...commonStyles.h3,
    fontSize: 18,
  },
});
