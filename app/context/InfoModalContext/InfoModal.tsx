import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { PropsWithChildren } from "react";
import { CrossIcon } from "../../components/icons/CrossIcon";
import { commonColors, commonStyles } from "../../styles";

interface InfoModalProps extends PropsWithChildren {
  title: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function InfoModal({ title, isVisible, onClose, children }: InfoModalProps) {
  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.modalContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose}>
            <CrossIcon height={20} strokeWidth={1.5} color={commonColors.vercelWhite} />
          </Pressable>
        </View>
        {children}
      </View>
    </Modal>
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
});
