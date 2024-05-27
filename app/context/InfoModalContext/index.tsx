import React, { createContext, useState, useContext } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import { Modal, View, StyleSheet } from "react-native";
import { ConfirmModal, ConfirmModalProps, GasFeesModal, GasFeesModalProps, InfoModal, InfoModalProps } from "./modals";

interface ModalState {
  isOpen: boolean;
  content?: ReactNode;
}

interface InfoModalExternalProps extends Omit<InfoModalProps, "closeModal"> {}

interface GasFeesModalExternalProps<T> extends Omit<GasFeesModalProps<T>, "closeModal"> {}

interface ConfirmModalExternalProps<T> extends Omit<ConfirmModalProps<T>, "closeModal"> {}

interface ModalContextType {
  modal: ModalState;
  // openModal: (content: ReactNode) => void;
  openInfoModal: (props: InfoModalExternalProps) => void;
  openConfirmModal: <T>(props: ConfirmModalExternalProps<T>) => Promise<T>;
  openGasFeesModal: <T>(props: GasFeesModalExternalProps<T>) => Promise<T>;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

function ModalProvider({ children }: PropsWithChildren) {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
  });

  const openModal = (content: ReactNode) => {
    setModal({ isOpen: true, content });
  };

  const openInfoModal = (props: InfoModalExternalProps) => {
    openModal(<InfoModal {...props} closeModal={closeModal} />);
  };

  const openConfirmModal = <T,>(props: ConfirmModalExternalProps<T>) => {
    return new Promise<T>((resolve, reject) => {
      openModal(
        <ConfirmModal
          {...props}
          closeModal={closeModal}
          onConfirm={async () => {
            const result = await props.onConfirm();
            resolve(result);
          }}
          onReject={async () => {
            if (props.onReject) {
              await props.onReject();
            }
            reject();
          }}
        />
      );
    });
  };

  const openGasFeesModal = <T,>(props: GasFeesModalExternalProps<T>) => {
    return new Promise<T>((resolve, reject) => {
      openModal(
        <GasFeesModal
          {...props}
          closeModal={closeModal}
          onConfirm={async () => {
            const result = await props.onConfirm();
            resolve(result);
          }}
          onReject={async () => {
            if (props.onReject) {
              await props.onReject();
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
    <ModalContext.Provider value={{ modal, openInfoModal, openConfirmModal, openGasFeesModal, closeModal }}>
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
