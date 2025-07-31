import { Modal } from "react-bootstrap";
import React, { useEffect } from "react";

export default function SelectedItemsModal({
    show,
    handleClose,
    selectedItems,
    setSelectedItems,
    setIsSomethingSelected,
    isSomethingSelected
}) {
    const selectedArray = Array.from(selectedItems.values());

    const columns = [
        { className: "code", key: "code", label: 'Código' },
        { className: "name", key: "name", label: 'Nombre' },
        { className: "stock", key: "stock", label: 'Stock' },
        { className: "remove", key: "remove", label: '' },
    ];

    const handleRemove = (code) => {
        const newSelected = new Map(selectedItems);
        newSelected.delete(code);
        setSelectedItems(newSelected);
        setIsSomethingSelected(newSelected.size > 0);
    };

    useEffect(() => {
        if (!isSomethingSelected) {
            handleClose();
        }
    }, [isSomethingSelected]);

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <div style={{ backgroundColor: "rgb(245, 193, 147)", padding: "10px 20px" }}>
                <h5 className="m-0">Productos Seleccionados</h5>
            </div>

            <Modal.Body style={{ backgroundColor: "#f0f0f0", maxHeight: "400px", overflowY: "auto" }}>
                {selectedArray.length === 0 ? (
                    <p className="text-center">No hay productos seleccionados.</p>
                ) : (
                    <table className="table table-bordered align-middle">
                        <thead>
                            <tr>
                                {columns.map((col, index) => (
                                    <th key={index} className={`col-${col.className}`}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {selectedArray.map((item) => (
                                <tr key={item.code}>
                                    <td>{item.code}</td>
                                    <td>{item.name}</td>
                                    <td>{item.stock}</td>
                                    <td className="text-center">
                                        <button
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
                )}
            </Modal.Body>

            <Modal.Footer style={{ backgroundColor: "#f0f0f0" }}>
                <button className="btn btn-secondary" onClick={handleClose}>Cerrar</button>
            </Modal.Footer>
        </Modal>
    );
}