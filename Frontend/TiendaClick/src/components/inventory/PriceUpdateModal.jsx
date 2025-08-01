import { Modal, Button, Form, Table } from "react-bootstrap";
import { useState, useEffect } from "react";

export default function PriceUpdateModal({
    show,
    handleClose,
    selectedItems,
    onApply,
    includeCombos,
    applyToAll,
    setApplyToAll,
    includeDiscounted,
    setIncludeDiscounted,
  }) {
    const [percentage, setPercentage] = useState("0");
    const [preview, setPreview] = useState([]);
  
    const handleApply = () => {
      const parsed = parseFloat(percentage);
      if (isNaN(parsed)) return;
      onApply(parsed, includeDiscounted, includeCombos, applyToAll);
      handleClose();
    };
  
    useEffect(() => {
      if (show && selectedItems.length > 0) {
        const parsed = parseFloat(percentage);
        const updated = selectedItems.map((product) => {
          const increase = product.sell_price * ((parsed || 0) / 100);
          return {
            ...product,
            new_price: (product.sell_price + increase).toFixed(2),
          };
        });
        setPreview(updated);
      }
    }, [percentage, selectedItems, show]);
  
    return (
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header style={{ backgroundColor: "rgb(245, 193, 147)" }} closeButton>
          <Modal.Title>Aumentar precios por porcentaje</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#f0f0f0" }}>
          <Form>
            <div className="mb-3">
              <Form.Check
                type="radio"
                label="Aplicar a todos los productos"
                name="applyScope"
                id="applyAll"
                value="all"
                checked={applyToAll}
                onChange={() => setApplyToAll(true)}
              />
              <Form.Check
                type="radio"
                label="Aplicar a productos seleccionados"
                name="applyScope"
                id="applySelected"
                value="selected"
                checked={!applyToAll}
                onChange={() => setApplyToAll(false)}
              />
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Ingrese el porcentaje de aumento</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="number"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="Ej: 10"
                  className={
                    parseFloat(percentage) > 0
                      ? "text-success"
                      : parseFloat(percentage) < 0
                      ? "text-danger"
                      : ""
                  }
                />
                <span>%</span>
              </div>
              <div className="text-muted fst-italic mt-1 d-flex align-items-center gap-2 small">
                <i className="bi bi-info-circle-fill"></i>
                <span>
                  Si se ingresa un número negativo se realizará un descuento permanente en los productos seleccionados
                </span>
              </div>
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Aplicar también a productos en oferta"
              checked={includeDiscounted}
              onChange={() => setIncludeDiscounted(!includeDiscounted)}
              className="mb-2"
            />
            {preview.length > 0 && (
              <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                <Table bordered hover>
                  <thead>
                    <tr style={{ backgroundColor: "rgb(245, 193, 147)" }}>
                      <th>Producto</th>
                      <th>Precio actual</th>
                      <th>Nuevo precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((product) => (
                      <tr key={product.code}>
                        <td>{product.name}</td>
                        <td>${product.sell_price.toFixed(2)}</td>
                        <td className="text-success fw-bold">${product.new_price}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#f0f0f0" }}>
          <Button
            onClick={handleApply}
            disabled={parseFloat(percentage) === 0}
            className="mt-2 send-form-button btn btn-success"
          >
            Aplicar cambios
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
  