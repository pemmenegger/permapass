import { View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import { CrossIcon } from "../../components/icons/CrossIcon";
import { commonColors, commonStyles } from "../../styles";
import { SecondaryButton } from "../../components/ui/buttons";

export interface ModalProps {
  title: string;
  content: string;
  closeModal: () => void;
}

export type ConfirmModalProps<T> = ModalProps & {
  onConfirm: () => Promise<T>;
  onReject?: () => Promise<void>;
};

const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <View style={styles.titleContainer}>
    <Text style={styles.title}>{title}</Text>
    <Pressable onPress={onClose}>
      <CrossIcon height={20} strokeWidth={1.5} color={commonColors.vercelWhite} />
    </Pressable>
  </View>
);

const ModalContent = ({ content }: { content: string }) => <Text style={styles.description}>{content}</Text>;

const InfoModal = ({ title, content, closeModal }: ModalProps) => {
  return (
    <View style={styles.modalContent}>
      <ModalHeader title={title} onClose={closeModal} />
      <ModalContent content={content} />
    </View>
  );
};

const ConfirmModal = <T,>({ title, content, closeModal, onConfirm, onReject }: ConfirmModalProps<T>) => {
  const handleReject = async () => {
    closeModal();
    if (onReject) {
      await onReject();
    }
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
