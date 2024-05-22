import React, { createContext, useState, useContext } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import InfoModal from "./InfoModal";

interface ModalContextType {
  modal: { isOpen: boolean; content: ReactNode };
  openModal: (title: string, content: ReactNode) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalState {
  isOpen: boolean;
  title: string;
  content: ReactNode | null;
}

function ModalProvider({ children }: PropsWithChildren) {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    content: null,
  });

  const openModal = (title: string, content: ReactNode) => {
    setModal({ isOpen: true, title, content });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal }}>
      {children}
      <InfoModal title={modal.title} isVisible={modal.isOpen} onClose={closeModal}>
        {modal.content}
      </InfoModal>
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
