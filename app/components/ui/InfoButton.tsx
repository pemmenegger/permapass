import React from "react";
import { StyleSheet, Text } from "react-native";
import { commonColors } from "../../styles";
import { useModal } from "../../context/InfoModalContext";
import { InfoModal } from "../../context/InfoModalContext/modals";

interface InfoButtonProps {
  label: string;
  description: string;
}

export default function InfoButton({ label, description }: InfoButtonProps) {
  const { openModal } = useModal();

  const onPress = () => {
    openModal(<InfoModal title={label} description={<Text style={styles.description}>{description}</Text>} />);
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
