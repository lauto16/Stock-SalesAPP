import { Modal, Button, Form } from "react-bootstrap";
import { useUser } from "../../context/UserContext.jsx";
import { useState, useEffect } from "react";
import { getAreUsersAllowedToDecideStockDecrease } from '../../services/axios.services.config.js'

export default function StockDecreaseConfirmationModal({
  show,
  handleClose,
  title,
  message,
  onConfirm,
  isSending = false,
  createLoss,
  setCreateLoss
}) {

  const { user } = useUser();
  const [usersAllowed, setUsersAllowed] = useState(false)

  useEffect(() => {
    setCreateLoss(createLoss);
  }, [createLoss, show]);

  useEffect(() => {
    const callUsersAllowed = async () => {
      const allowedStockDecrease = await getAreUsersAllowedToDecideStockDecrease(user.token);
      setUsersAllowed(allowedStockDecrease.areUsersAllowedValue)
    } 
    callUsersAllowed()

    console.log(usersAllowed);
    
  },[]);


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

        <Form className="mt-3">
          <Form.Check
            type="checkbox"
            label="Considerar como pérdida de dinero"
            checked={createLoss}
            disabled={!usersAllowed}
            onChange={(e) => setCreateLoss(e.target.checked)}
          />
        </Form>
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
          onClick={() => onConfirm(createLoss)}
          disabled={isSending}
          className="mt-2 send-form-button btn-danger"
        >
          Aceptar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}