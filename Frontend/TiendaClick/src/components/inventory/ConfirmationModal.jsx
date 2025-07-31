import { Modal, Button } from "react-bootstrap";

export default function ConfirmationModal({ show, handleClose, title, message, onSendForm }) {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header style={{ backgroundColor: "rgb(245, 193, 147)" }} closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: "#f0f0f0" }}>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: "#f0f0f0" }}>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button onClick={onSendForm} className="mt-2 send-form-button btn btn-success">
          Aceptar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}