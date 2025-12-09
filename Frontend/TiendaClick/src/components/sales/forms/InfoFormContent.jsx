import { Row, Col } from "react-bootstrap";
import CustomInput from "../../crud/CustomInput";
import Table from "../../crud/Table";

export default function InfoFormContent({ register, selectedItem, errors }) {
    // InfoForm content for editing sales
    // Only discount percentage and discount reason are editable
    // Products and quantities cannot be modified after sale creation

    // Transform items to flatten product data for table display
    const tableItems = selectedItem.items?.map(item => ({
        code: item.product?.code || 'N/A',
        name: item.product?.name || 'N/A',
        quantity: item.quantity,
        unit_price: `$${item.unit_price?.toFixed(2) || '0.00'}`,
        subtotal: `$${item.subtotal?.toFixed(2) || '0.00'}`
    })) || [];

    const columns = [
        { className: "code", key: "code", label: "Código" },
        { className: "name", key: "name", label: "Nombre" },
        { className: "quantity", key: "quantity", label: "Cantidad" },
        { className: "unit_price", key: "unit_price", label: "Precio Unit." },
        { className: "subtotal", key: "subtotal", label: "Subtotal" },
    ];

    return (
        <Row className="g-3">
            {/* Sale ID (hidden) */}
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    defaultValue={selectedItem.id}
                    register={register('id', {})}
                    inputStyle={{ display: 'none' }}
                />
            </Col>

            {/* Sale Information (Read-only display) */}
            <Col md={12}>
                <div className="alert alert-info">
                    <h6>Información de la venta</h6>
                    <p className="mb-1"><strong>ID:</strong> #{selectedItem.id}</p>
                    <p className="mb-1"><strong>Fecha:</strong> {selectedItem.created_at}</p>
                    <p className="mb-1"><strong>Vendedor:</strong> {selectedItem.created_by_name || 'N/A'}</p>
                    <p className="mb-1"><strong>Productos:</strong> {selectedItem.product_count || selectedItem.items?.length || 0}</p>
                    <p className="mb-0"><strong>Total (sin descuento):</strong> ${selectedItem.initial_price || selectedItem.total_price}</p>
                </div>
            </Col>

            {/* Discount Percentage (Editable) */}
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Descuento (%)'
                    icon='bi-percent'
                    type='number'
                    step='0.01'
                    defaultValue={selectedItem.applied_discount_percentage || 0}
                    register={register('applied_discount_percentage', {
                        min: {
                            value: -100,
                            message: "El descuento no puede ser menor a -100%"
                        },
                        max: {
                            value: 100,
                            message: "El descuento no puede ser mayor a 100%"
                        }
                    })}
                />
                {errors.applied_discount_percentage?.message && (
                    <div className="invalid-feedback d-block">
                        {errors.applied_discount_percentage.message}
                    </div>
                )}
                <small className="text-muted">
                    Valores negativos = aumentos, positivos = descuentos
                </small>
            </Col>

            {/* Products List (Read-only) */}
            {tableItems.length > 0 && (
                <Col md={12}>
                    <h6>Productos en esta venta:</h6>

                    <Table columns={columns} items={tableItems} />
                    <small className="text-muted">
                        Los productos no pueden ser modificados después de crear la venta
                    </small>
                </Col>
            )}
        </Row>
    );
}
