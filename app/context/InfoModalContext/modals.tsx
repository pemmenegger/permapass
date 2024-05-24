import { View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import { ReactNode } from "react";
import { CrossIcon } from "../../components/icons/CrossIcon";
import { commonColors, commonStyles } from "../../styles";
import { useModal } from ".";
import { SecondaryButton } from "../../components/ui/buttons";

interface ModalProps {
  title: string;
  content: string | ReactNode;
}

export interface InfoModalProps extends ModalProps {}

interface ConfirmModalProps extends ModalProps {
  onConfirm: () => Promise<void>;
  onReject: () => Promise<void>;
}

const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <View style={styles.titleContainer}>
    <Text style={styles.title}>{title}</Text>
    <Pressable onPress={onClose}>
      <CrossIcon height={20} strokeWidth={1.5} color={commonColors.vercelWhite} />
    </Pressable>
  </View>
);

const ModalContent = ({ content }: { content: string | ReactNode }) => (
  <>{typeof content === "string" ? <Text style={styles.description}>{content}</Text> : content}</>
);

const InfoModal = ({ title, content }: InfoModalProps) => {
  const { closeModal } = useModal();
  return (
    <View style={styles.modalContent}>
      <ModalHeader title={title} onClose={closeModal} />
      <ModalContent content={content} />
    </View>
  );
};

const ConfirmModal = ({ title, content, onConfirm, onReject }: ConfirmModalProps) => {
  const { closeModal } = useModal();

  const handleReject = async () => {
    closeModal();
    await onReject();
  };

  const handleConfirm = async () => {
    closeModal();
    await onConfirm();
  };

  return (
    <View style={styles.modalContent}>
      <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          <ModalHeader title={title} onClose={handleReject} />
          <ModalContent content={content} />
        </View>
        <SecondaryButton title="Continue" onPress={handleConfirm} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    height: "40%",
    width: "100%",
    backgroundColor: commonColors.vercelBlack,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: "absolute",
    bottom: 0,
    paddingHorizontal: commonStyles.outerMarginHorizontal + commonStyles.innerMarginHorizontal,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 18,
    paddingBottom: 24,
  },
  title: {
    fontFamily: "Inter-Medium",
    color: commonColors.vercelWhite,
    fontSize: 18,
  },
  description: {
    color: commonColors.vercelWhite,
    fontSize: 16,
  },
});

export { InfoModal, ConfirmModal };
