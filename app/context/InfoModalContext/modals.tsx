import { View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import { ReactNode } from "react";
import { CrossIcon } from "../../components/icons/CrossIcon";
import { commonColors, commonStyles } from "../../styles";
import { useModal } from ".";
import DefaultButton from "../../components/ui/DefaultButton";

export interface ModalProps {
  title: string;
  content: string | ReactNode;
}

export function InfoModal({ title, content }: ModalProps) {
  const { closeModal } = useModal();
  return (
    <View style={styles.modalContent}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={closeModal}>
          <CrossIcon height={20} strokeWidth={1.5} color={commonColors.vercelWhite} />
        </Pressable>
      </View>
      {typeof content === "string" ? <Text style={styles.description}>{content}</Text> : content}
    </View>
  );
}

interface ConfirmModalProps extends ModalProps {
  onConfirm: () => Promise<void>;
  onReject: () => Promise<void>;
}

export function ConfirmModal({ title, content, onConfirm, onReject }: ConfirmModalProps) {
  const { closeModal } = useModal();

  return (
    <View style={styles.modalContent}>
      <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              onPress={async () => {
                closeModal();
                await onReject();
              }}
            >
              <CrossIcon height={20} strokeWidth={1.5} color={commonColors.vercelWhite} />
            </Pressable>
          </View>
          {typeof content === "string" ? <Text style={styles.description}>{content}</Text> : content}
        </View>
        <DefaultButton
          text="Ok"
          onPress={async () => {
            closeModal();
            await onConfirm();
          }}
          type="secondary"
        />
      </SafeAreaView>
    </View>
  );
}

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
  description: {
    color: commonColors.vercelWhite,
    fontSize: 16,
  },
});
