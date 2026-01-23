import { Modal } from "react-bootstrap";

export default function SelectedItemsModal({
    show,
    handleClose,
    selectedItems,
    setSelectedItems,
    columns
}) {
    const selectedArray = Array.from(selectedItems.entries());

    const handleRemove = (key) => {
        const newSelected = new Map(selectedItems);
        newSelected.delete(key);
        setSelectedItems(newSelected);

        if (newSelected.size === 0) {
            handleClose();
        }
    };



    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <div style={{ backgroundColor: "rgb(245, 193, 147)", padding: "10px 20px" }}>
                <h5 className="m-0">Items seleccionados</h5>
            </div>

            <Modal.Body style={{ backgroundColor: "#f0f0f0", maxHeight: "400px", overflowY: "auto" }}>

                <table className="table table-bordered align-middle">
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index} className={`col-${col.className}`}>{col.label}</th>
                            ))}
                            <th key={"remove"} className={`col-remove`}>Deseleccionar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedArray.map(([key, item]) => (
                            <tr key={key}>
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex}>{item[column.key]}</td>
                                ))}
                                <td className="text-center">
                                    <button
                                        className="btn btn-sm btn-remove"
                                        onClick={() => handleRemove(key)}
                                        title="Deseleccionar"
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Modal.Body>

            <Modal.Footer style={{ backgroundColor: "#f0f0f0" }}>
                <button className="btn btn-secondary" onClick={handleClose}>Cerrar</button>
            </Modal.Footer>
        </Modal>
    );
}