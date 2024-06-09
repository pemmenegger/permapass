import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { commonColors, commonStyles } from "../../styles";

interface TitleProps {
  text: string;
  highlight: string;
}

export default function Title({ text, highlight }: TitleProps) {
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
    ...commonStyles.h1,
  },
  highlight: {
    color: commonColors.primary,
  },
});
