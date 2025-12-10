import { Modal, Button } from "react-bootstrap";

export default function ConfirmationModal({ show, handleClose, title, message, onSendForm, isSending }) {

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header style={{ backgroundColor: "rgb(245, 193, 147)" }} closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: "#f0f0f0" }}>
        {typeof message === 'string' ? (
          <p style={{ whiteSpace: "pre-line" }}>{message}</p>
        ) : (
          message
        )}
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: "#f0f0f0" }}>
        <Button className="mt-2 btn-secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button onClick={onSendForm} disabled={isSending} className="mt-2 send-form-button btn btn-success">
          Aceptar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}