import React from "react";
import { StyleSheet, Text } from "react-native";
import { commonColors } from "../../styles";
import { useModal } from "../../context/InfoModalContext";
import { InfoModal, ModalProps } from "../../context/InfoModalContext/modals";

export default function InfoButton({ title, content }: ModalProps) {
  const { openModal } = useModal();

  const onPress = () => {
    openModal(<InfoModal title={title} content={content} />);
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
