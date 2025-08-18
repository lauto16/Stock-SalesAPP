import { Modal, Button, Table as BSTable } from "react-bootstrap";

export default function SaleDetailModal({ show, handleClose, sale }) {
  if (!sale) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      contentClassName="blurred-modal-content"
      backdropClassName="blurred-backdrop"
    >
      <Modal.Header style={{ backgroundColor: "#f5c193" }} closeButton>
        <Modal.Title>Detalles de la Venta #{sale.id}</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: "#f0f0f0" }}>
        <p><b>Fecha:</b> {sale.created_at}</p>
        <p><b>Vendedor:</b> {sale.created_by_name}</p>
        <p><b>Descuento aplicado:</b> {sale.applied_discount_percentage}%</p>
        <p><b>Total (sin IVA):</b> ${sale.total_price}</p>
        <p><b>Total (con IVA):</b> ${sale.total_price_iva}</p>

        <h5>Productos en la venta:</h5>
        <BSTable striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.products?.map((product, idx) => (
              <tr key={idx}>
                <td>{product.code}</td>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
                <td>${product.unit_price.toFixed(2)}</td>
                <td>${(product.quantity * product.unit_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </BSTable>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}