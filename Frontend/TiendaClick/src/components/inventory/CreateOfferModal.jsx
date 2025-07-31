import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CreateOfferModal({
    show,
    handleClose,
    selectedItems,
    setSelectedItems,
    setIsSomethingSelected,
    fetchGetByCode,
}) {
    const {
        register,
        watch,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    const [products, setProducts] = useState([]);
    const [endDate, setEndDate] = useState(null);
    const percentage = watch("percentage", 0);

    useEffect(() => {
        const fetchProducts = async () => {
            const result = [];
            for (const code of selectedItems.keys()) {
                const data = await fetchGetByCode(code);
                result.push(data);
            }
            setProducts(result);
        };
        fetchProducts();
    }, [selectedItems]);

    const handleRemove = (code) => {
        const newSelected = new Map(selectedItems);
        newSelected.delete(code);
        setSelectedItems(newSelected);
        setIsSomethingSelected(newSelected.size > 0);
    };

    const getPriceWithDiscount = (sell_price) =>
        sell_price + (sell_price * percentage) / 100;

    const getColorClass = () =>
        percentage > 0 ? "text-success" : percentage < 0 ? "text-danger" : "text-dark";

    const onSubmit = (data) => {
        const offerPayload = {
            endDate,
            percentage: parseFloat(data.percentage),
            products: Array.from(selectedItems.keys()),
        };
        console.log("Crear oferta:", offerPayload);
        // Aquí podrías enviar offerPayload a tu API
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header
                closeButton
                onHide={handleClose}
                style={{ backgroundColor: "rgb(245, 193, 147)" }}
            >
                <Modal.Title className="m-0">Crear oferta temporal</Modal.Title>
            </Modal.Header>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body style={{ backgroundColor: "#f0f0f0" }}>
                    <div className="mb-3">
                        <label className="form-label">Fecha de finalización</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            className="form-control date-picker"
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Seleccioná una fecha"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Porcentaje de descuento</label>
                        <input
                            type="number"
                            step="any"
                            className={`form-control ${getColorClass()}`}
                            {...register("percentage", { required: true })}
                            placeholder="Ej: -20 para 20% de descuento"
                        />
                        <div className="text-muted fst-italic mt-1 d-flex align-items-center gap-2 small">
                            <i className="bi bi-info-circle-fill"></i>
                            <span>
                                Porcentajes positivos aumentan el precio, negativos lo disminuyen.
                            </span>
                        </div>
                    </div>

                    <div>
                        <h6>Productos seleccionados</h6>
                        {products.length === 0 ? (
                            <p className="text-center">No hay productos seleccionados.</p>
                            /*maybe re-use the Table component?*/
                        ) : (

                            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                                <table className="table table-bordered align-middle offer-table">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Nombre</th>
                                            <th>Stock</th>
                                            <th>Precio</th>
                                            <th>Precio ajustado</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((item) => (
                                            <tr key={item.code} className="offer-table-tbody-tr">
                                                <td>{item.code}</td>
                                                <td>{item.name}</td>
                                                <td>{item.stock}</td>
                                                <td>
                                                    {typeof item.sell_price === "number"
                                                        ? `$${item.sell_price.toFixed(2)}`
                                                        : "—"}
                                                </td>
                                                <td className={getColorClass()}>
                                                    {typeof item.sell_price === "number"
                                                        ? `$${getPriceWithDiscount(item.sell_price).toFixed(2)}`
                                                        : "—"}
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-remove"
                                                        onClick={() => handleRemove(item.code)}
                                                        title="Deseleccionar"
                                                    >
                                                        <i className="bi bi-x-lg"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer style={{ backgroundColor: "#f0f0f0" }}>
                    <button type="submit" className="mt-2 send-form-button btn btn-success">
                        Crear oferta
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}