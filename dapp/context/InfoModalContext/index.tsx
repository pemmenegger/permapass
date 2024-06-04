import React, { createContext, useState, useContext } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import { Modal, View, StyleSheet } from "react-native";
import { ConfirmModal, ConfirmModalProps, InfoModal, InfoModalProps } from "./modals";
import { HaLoNFCChipSignatureOutput, useHaLoNFCChip } from "../../hooks/useHaloNFCChip";

interface ModalState {
  isOpen: boolean;
  content?: ReactNode;
}

interface InfoModalExternalProps extends Omit<InfoModalProps, "closeModal"> {}

interface ConfirmModalExternalProps<T> extends Omit<ConfirmModalProps<T>, "title" | "closeModal"> {}

interface ChipSignatureModalProps<T> extends Omit<ConfirmModalExternalProps<T>, "onConfirm"> {}

interface ModalContextType {
  openInfoModal: (props: InfoModalExternalProps) => void;
  openGasFeesModal: <T>(props: ConfirmModalExternalProps<T>) => Promise<T>;
  openChipSignatureModal: <T>(props: ChipSignatureModalProps<T>) => Promise<HaLoNFCChipSignatureOutput | undefined>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

function ModalProvider({ children }: PropsWithChildren) {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
  });
  const { haloNFCChip } = useHaLoNFCChip();

  const openModal = (content: ReactNode) => {
    setModal({ isOpen: true, content });
  };

  const openInfoModal = (props: InfoModalExternalProps) => {
    openModal(<InfoModal {...props} closeModal={closeModal} />);
  };

  const openGasFeesModal = <T,>({ content, onConfirm, onReject }: ConfirmModalExternalProps<T>) => {
    return new Promise<T>((resolve, reject) => {
      openModal(
        <ConfirmModal
          title="Gas Fees"
          content={`${content} Click continue to be redirected to your wallet app to confirm and pay gas fees for this blockchain transaction.`}
          closeModal={closeModal}
          onConfirm={async () => {
            const result = await onConfirm();
            resolve(result);
          }}
          onReject={async () => {
            if (onReject) {
              await onReject();
            }
            reject();
          }}
        />
      );
    });
  };

  const openChipSignatureModal = <T,>({ content, onReject }: ChipSignatureModalProps<T>) => {
    return new Promise<HaLoNFCChipSignatureOutput | undefined>((resolve, reject) => {
      openModal(
        <ConfirmModal
          title="HaLo NFC Chip Signature"
          content={`${content} Click continue and hold your chip near your device to sign with the chip.`}
          closeModal={closeModal}
          onConfirm={async () => {
            try {
              if (!haloNFCChip.computeSignatureFromChip) {
                throw new Error("HaLo NFC Chip not available");
              }
              const signature = await haloNFCChip.computeSignatureFromChip();
              resolve(signature);
              return signature;
            } catch (error) {
              reject();
            }
          }}
          onReject={async () => {
            if (onReject) {
              await onReject();
            }
            reject();
          }}
        />
      );
    });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false, content: undefined }));
  };

  return (
    <ModalContext.Provider value={{ openInfoModal, openGasFeesModal, openChipSignatureModal }}>
      <View style={styles.container}>
        {modal.isOpen && <View style={styles.overlay} />}
        {children}
      </View>
      <Modal animationType="slide" transparent={true} visible={modal.isOpen}>
        {modal.content}
      </Modal>
    </ModalContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 1,
  },
});

const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export { ModalProvider, useModal };
