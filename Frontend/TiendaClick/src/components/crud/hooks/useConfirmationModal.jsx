import { useState, useCallback, useRef } from "react";
import ConfirmationModal from "../ConfirmationModal.jsx";

export function useConfirmationModal() {
  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [confirmed, setConfirmed] = useState(null)

  const openConfirmation = useCallback(({ title, message, onConfirm }) => {
    setModalConfig({
      show: true,
      title,
      message,
      onConfirm,
    });
  }, []);

  const closeModal = () => {
    setConfirmed(false)
    setModalConfig(prev => ({ ...prev, show: false }));
  };

  const handleConfirm = () => {
    setConfirmed(true)
    closeModal();
  };

  const ModalComponent = (
    <ConfirmationModal
      show={modalConfig.show}
      handleClose={closeModal}
      title={modalConfig.title}
      message={modalConfig.message}
      onSendForm={handleConfirm}
    />
  );

  return {
    ConfirmationModal: ModalComponent,
    openConfirmation,
    userConfirmed: confirmed
  };
}