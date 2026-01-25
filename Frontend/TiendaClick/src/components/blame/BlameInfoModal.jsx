import { Modal, Row, Col } from "react-bootstrap";

export default function BlameInfoModal({ show, onHide, blameItem }) {
  if (!blameItem) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dateString.replaceAll("-", "/");
  };

  const getFieldLabel = (fieldName) => {
    const fieldLabels = {
      "Stock": "Stock",
      "name": "Nombre",
      "code": "Código",
      "price": "Precio",
      "provider_name": "Proveedor",
    };
    return fieldLabels[fieldName] || fieldName;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header style={{ backgroundColor: "#f5c193" }} closeButton>
                <Modal.Title>Modificación del producto</Modal.Title>
            </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col md={12}>
            <div className="alert alert-info">
              <h6>Información del Producto</h6>
              <p className="mb-1">
                <strong>Código:</strong> {blameItem.object_data?.code || blameItem.object_code || 'N/A'}
              </p>
              <p className="mb-1">
                <strong>Nombre:</strong> {blameItem.object_data?.name || blameItem.object_name || 'N/A'}
              </p>
              {blameItem.object_data?.provider_name && (
                <p className="mb-0">
                  <strong>Proveedor:</strong> {blameItem.object_data.provider_name}
                </p>
              )}
            </div>
          </Col>

          <Col md={12}>
            <div className="alert alert-warning">
              <h6>Detalles del Cambio</h6>
              <p className="mb-1">
                <strong>Campo modificado:</strong> {getFieldLabel(blameItem.field_name)}
              </p>
              <p className="mb-1">
                <strong>Valor anterior:</strong> <span className="text-danger">{blameItem.old_value}</span>
              </p>
              <p className="mb-1">
                <strong>Valor nuevo:</strong> <span className="text-success">{blameItem.new_value}</span>
              </p>
              <p className="mb-1">
                <strong>Modificado por:</strong> {blameItem.changed_by}
              </p>
              <p className="mb-0">
                <strong>Fecha:</strong> {formatDate(blameItem.changed_at)}
              </p>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>
          Cerrar
        </button>
      </Modal.Footer>
    </Modal>
  );
}