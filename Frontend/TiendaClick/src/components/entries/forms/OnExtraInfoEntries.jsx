import { Row, Col, Form, Button } from "react-bootstrap";
import CustomInput from "../../crud/CustomInput";
import { formatDate, formatHour } from "../../../utils/formatDate.js";
import { useState, useEffect } from "react";

export default function OnExtraInfoEntries({ register, selectedItem }) {
    const [dynamicColSpan, setDynamicColSpan] = useState(4);
    useEffect(() => {
        //Responsive design for dynamicColSpan changing when a product is selected
        const widthColspan = window.innerWidth <= 600 ? 2 : 4;
        setDynamicColSpan(widthColspan);
    }, []);


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
                    <p className="mb-1"><strong>Número de remito:</strong> {selectedItem.rute_number}</p>
                    <p className="mb-1"><strong>Fecha:</strong> {formatDate(selectedItem.created_at)} - {formatHour(selectedItem.created_at)}</p>
                    <p className="mb-1"><strong>Creado por:</strong> {selectedItem.created_by || 'N/A'}</p>
                    <p className="mb-1"><strong>Productos:</strong> {selectedItem.details?.length || 0}</p>
                    <p className="mb-1"><strong>Observaciones:</strong> {selectedItem.observations || 'N/A'}</p>
                    <p className="mb-0"><strong>Total:</strong> ${selectedItem.total}</p>
                </div>
            </Col>

            <Col md={12}>
                <h6>Productos en esta entrada:</h6>

                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>Producto</th>
                            <th className="hide-mobile">Código</th>
                            <th className="text-center">Cantidad</th>
                            <th className="text-center">Precio Unit.</th>
                            <th className="text-end hide-mobile">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedItem.details?.length > 0 ? (
                            selectedItem.details.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.product_name}</td>
                                    <td className="hide-mobile">{item.product_code}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-center">
                                        ${Number(item.unit_price).toFixed(2)}
                                    </td>
                                    <td className="text-end hide-mobile">
                                        ${Number(item.subtotal).toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={dynamicColSpan} className="text-center text-muted">
                                    No hay productos en esta entrada
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="table-secondary">
                        <tr>
                            <td colSpan={dynamicColSpan} className="text-end">
                                <strong>Total:</strong>
                            </td>
                            <td className="text-end">
                                <strong>${selectedItem.total}</strong>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </Col>
        </Row>
    );
}