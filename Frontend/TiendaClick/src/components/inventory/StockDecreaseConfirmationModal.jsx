import { Modal, Button } from "react-bootstrap";

export default function StockDecreaseConfirmationModal({
  show,
  handleClose,
  title,
  message,
  onConfirm,
  isSending = false
}) {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
      style={{ zIndex: 2000 }}
      backdropClassName="stock-decrease-backdrop"
    >
      <Modal.Header
        style={{ backgroundColor: "rgb(245, 193, 147)" }}
        closeButton
      >
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: "#f0f0f0" }}>
        {typeof message === "string" ? (
          <p style={{ whiteSpace: "pre-line" }}>{message}</p>
        ) : (
          message
        )}
      </Modal.Body>

      <Modal.Footer style={{ backgroundColor: "#f0f0f0" }}>
        <Button
          className="mt-2 btn-secondary"
          onClick={handleClose}
          disabled={isSending}
        >
          Cancelar
        </Button>

        <Button
          onClick={onConfirm}
          disabled={isSending}
          className="mt-2 send-form-button btn-danger"
        >
          Aceptar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
