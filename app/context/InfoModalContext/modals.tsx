import { View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import { CrossIcon } from "../../components/icons/CrossIcon";
import { commonColors, commonStyles } from "../../styles";
import { useModal } from ".";
import { SecondaryButton } from "../../components/ui/buttons";
import { useWalletClient } from "wagmi";

interface ModalProps {
  title: string;
  content: string;
}

export interface InfoModalProps extends ModalProps {}

interface ConfirmModalProps extends ModalProps {
  onConfirm: () => Promise<void>;
  onReject?: () => Promise<void>;
}

export interface GasFeesModalProps extends Omit<ConfirmModalProps, "title"> {}

const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <View style={styles.titleContainer}>
    <Text style={styles.title}>{title}</Text>
    <Pressable onPress={onClose}>
      <CrossIcon height={20} strokeWidth={1.5} color={commonColors.vercelWhite} />
    </Pressable>
  </View>
);

const ModalContent = ({ content }: { content: string }) => <Text style={styles.description}>{content}</Text>;

const ConfirmModal = ({ title, content, onConfirm, onReject }: ConfirmModalProps) => {
  const { closeModal } = useModal();

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

const InfoModal = ({ title, content }: InfoModalProps) => {
  const { closeModal } = useModal();
  return (
    <View style={styles.modalContent}>
      <ModalHeader title={title} onClose={closeModal} />
      <ModalContent content={content} />
    </View>
  );
};

const GasFeesModal = ({ content, onConfirm, onReject }: GasFeesModalProps) => {
  return (
    <ConfirmModal
      title="Gas Fees"
      content={`${content} Click continue to be redirected to your wallet app to confirm and pay gas fees for this blockchain transaction.`}
      onConfirm={onConfirm}
      onReject={onReject}
    />
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

export { InfoModal, ConfirmModal, GasFeesModal };
