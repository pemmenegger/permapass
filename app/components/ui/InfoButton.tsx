import React, { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { commonColors } from "../../styles";
import { useModal } from "../../context/InfoModalContext";

interface InfoButtonProps {
  label: string;
  description: string;
}

export default function InfoButton({ label, description }: InfoButtonProps) {
  const { openModal } = useModal();

  const onPress = () => {
    openModal(label, <Text style={styles.description}>{description}</Text>);
  };

  return (
    <Text style={styles.link} onPress={onPress}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: {
    color: commonColors.primary,
    textDecorationLine: "underline",
  },
  description: {
    color: commonColors.vercelWhite,
    fontSize: 16,
  },
});
