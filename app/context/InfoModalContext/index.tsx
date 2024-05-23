import React, { createContext, useState, useContext } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import { Modal } from "react-native";

interface ModalContextType {
  modal: { isOpen: boolean; content: ReactNode };
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalState {
  isOpen: boolean;
  content: ReactNode | null;
}

function ModalProvider({ children }: PropsWithChildren) {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    content: null,
  });

  const openModal = (content: ReactNode) => {
    setModal({ isOpen: true, content });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal }}>
      {children}
      <Modal animationType="slide" transparent={true} visible={modal.isOpen}>
        {modal.content}
      </Modal>
    </ModalContext.Provider>
  );
}

const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export { ModalProvider, useModal };
