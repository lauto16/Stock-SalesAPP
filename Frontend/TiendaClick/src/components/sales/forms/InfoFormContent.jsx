import { Row, Col, Button } from "react-bootstrap";
import CustomInput from "../../crud/CustomInput";
import Table from "../../crud/Table";
import ConfirmationModal from "../../crud/ConfirmationModal";
import { formatDate, formatHour } from "../../../utils/formatDate.js";
import { useState } from "react";
import { printSaleTicket } from '../../../services/axios.services.sales.js'
import { useUser } from "../../../context/UserContext.jsx";

export default function InfoFormContent({ register, selectedItem, errors }) {
    const { user } = useUser();
    const [printMode, setPrintMode] = useState(false);
    const [showPrintOptions, setShowPrintOptions] = useState(false);
    

    const handleBrowserPrint = () => {
        setPrintMode(true);
        setTimeout(() => {
            window.print();
            setPrintMode(false);
        }, 100);
    };

    const handleThermalPrint = async () => {
        setPrintMode(true);

        try {
            const result = await printSaleTicket(
                selectedItem.id,
                user.token
            );

            if (result?.success) {
                console.log("Ticket enviado a impresora térmica");
            } else {
                console.error("No se pudo imprimir");
            }

        } catch (error) {
            console.error(error);
        }

        setPrintMode(false);
    };

    const tableItems = selectedItem.items?.map(item => ({
        code: item.product?.code || 'N/A',
        name: item.product?.name || 'N/A',
        quantity: item.quantity,
        unit_price: `$${item.unit_price?.toFixed(2) || '0.00'}`,
        subtotal: `$${item.subtotal?.toFixed(2) || '0.00'}`
    })) || [];

    const columns = [
        !printMode && { className: "code", key: "code", label: "Código" },
        { className: "name", key: "name", label: "Nombre" },
        { className: "quantity", key: "quantity", label: "Cantidad" },
        { className: "unit_price", key: "unit_price", label: "Precio Unit." },
        { className: "subtotal", key: "subtotal", label: "Subtotal" },
    ].filter(Boolean);

    return (
        <>
            <Row className="g-3">

                {!printMode && (
                    <Col md={12} className="text-end">
                        <Button variant="secondary" onClick={() => setShowPrintOptions(true)}>
                            🖨 Imprimir ticket
                        </Button>
                    </Col>
                )}

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
                        <p className="mb-1"><strong>ID:</strong> #{selectedItem.id}</p>
                        <p className="mb-1">
                            <strong>Fecha:</strong> {formatDate(selectedItem.created_at)} - {formatHour(selectedItem.created_at)}
                        </p>

                        {!printMode && (
                            <p className="mb-1">
                                <strong>Vendedor:</strong> {selectedItem.created_by || 'N/A'}
                            </p>
                        )}

                        <p className="mb-1">
                            <strong>Productos:</strong> {selectedItem.product_count || selectedItem.items?.length || 0}
                        </p>

                        <p className="mb-0">
                            <strong>Total:</strong> ${selectedItem.total_price}
                        </p>
                    </div>
                </Col>

                {tableItems.length > 0 && (
                    <Col md={12}>
                        {!printMode && <h6>Productos en esta venta:</h6>}
                        <Table columns={columns} items={tableItems} />
                    </Col>
                )}
            </Row>

            <ConfirmationModal
                show={showPrintOptions}
                handleClose={() => setShowPrintOptions(false)}
                title="Opciones de impresión"
                message="¿Deseas imprimir en impresora de calor o ver otras opciones de impresión?"
                confirmText="Impresora de calor"
                cancelText="Ver otras opciones"
                onSendForm={() => {
                    setShowPrintOptions(false);
                    handleThermalPrint();
                }}
                onCancelAction={handleBrowserPrint}
            />
        </>
    );
}