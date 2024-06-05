import React from "react";
import { StyleSheet, Text } from "react-native";
import { commonColors } from "../../styles";
import { useModal } from "../../context/ModalContext";

interface InfoTextProps {
  title: string;
  content: string;
}

export default function InfoText({ title, content }: InfoTextProps) {
  const { openInfoModal } = useModal();

  const onPress = () => {
    openInfoModal({
      title,
      content,
    });
  };

  return (
    <Text style={styles.link} onPress={onPress}>
      {title}
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
