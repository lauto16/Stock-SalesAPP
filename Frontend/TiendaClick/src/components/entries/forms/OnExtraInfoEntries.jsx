import { Row, Col, Form, Button } from "react-bootstrap";
import CustomInput from "../../crud/CustomInput";
import Table from "../../crud/Table";
import { formatDate, formatHour } from "../../../utils/formatDate.js";

export default function OnExtraInfoEntries({ register, selectedItem, errors }) {

    // Transform items to flatten product data for table display
    const tableItems = selectedItem.details?.map(item => ({
        product_name: item.product_name,
        product_code: item.product_code,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
    })) || [];

    const columns = [
        { className: "Producto", key: "product_name", label: "Producto" },
        { className: "Código", key: "product_code", label: "Código" },
        { className: "quantity", key: "quantity", label: "Cantidad" },
        { className: "unit_price", key: "unit_price", label: "Precio Unit." },
        { className: "subtotal", key: "subtotal", label: "Subtotal" },
    ];
    return (
        <Row className="g-3">
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    defaultValue={selectedItem.id}
                    register={register('id', {})}
                    inputStyle={{ display: 'none' }}
                />
            </Col>

            <Col md={12}>
                <div className="alert alert-info">
                    <h6>Información de la venta</h6>
                    <p className="mb-1"><strong>Número de remito:</strong> #{selectedItem.rute_number}</p>
                    <p className="mb-1"><strong>Fecha:</strong> {formatDate(selectedItem.created_at)} - {formatHour(selectedItem.created_at)}</p>
                    <p className="mb-1"><strong>Vendedor:</strong> {selectedItem.created_by || 'N/A'}</p>
                    <p className="mb-1"><strong>Productos:</strong> {selectedItem.details?.length || 0}</p>
                    <p className="mb-0"><strong>Total:</strong> ${selectedItem.total}</p>
                </div>
            </Col>

            <Col md={12}>
                <h6>Productos en esta entrada:</h6>

                <Table columns={columns} items={tableItems} >
                    <tfoot className="table-secondary">
                        <tr>
                            <td colSpan="5" className="text-end">
                                <strong>Subtotal:</strong>
                            </td>
                            <td className="text-end">
                                <strong>$0</strong>
                            </td>
                        </tr>


                    </tfoot>
                </Table>


            </Col>
        </Row>
    );
}