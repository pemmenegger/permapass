import { View, Text, Pressable, StyleSheet } from "react-native";
import { ReactNode } from "react";
import { CrossIcon } from "../../components/icons/CrossIcon";
import { commonColors, commonStyles } from "../../styles";
import { useModal } from ".";
import DefaultButton from "../../components/ui/DefaultButton";

interface InfoModalProps {
  title: string;
  description: ReactNode;
}

export function InfoModal({ title, description }: InfoModalProps) {
  const { closeModal } = useModal();
  return (
    <View style={styles.modalContent}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={closeModal}>
          <CrossIcon height={20} strokeWidth={1.5} color={commonColors.vercelWhite} />
        </Pressable>
      </View>
      {description}
    </View>
  );
}

interface OpenWalletModalProps {
  title: string;
  description: ReactNode;
  onConfirm: () => Promise<void>;
  // onReject: () => void;
}

export function OpenWalletModal({ title, description, onConfirm }: OpenWalletModalProps) {
  const { closeModal } = useModal();

  return (
    <View style={styles.modalContent}>
      <View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        {description}
      </View>
      <DefaultButton
        text="Open Wallet"
        onPress={async () => {
          closeModal();
          await onConfirm();
        }}
        type="secondary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    height: "40%",
    width: "100%",
    backgroundColor: commonColors.vercelBlack,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: "absolute",
    bottom: 0,
    paddingHorizontal: commonStyles.outerMarginHorizontal + commonStyles.innerMarginHorizontal,
    elevation: 5,
    shadowColor: commonColors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
});
