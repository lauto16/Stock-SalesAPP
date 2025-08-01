import React, { useState } from "react";
import { Dropdown, ButtonGroup } from "react-bootstrap";
import TitleDropdown from "../global/TitleDropdown";

export default function ProvidersHeader({
  isSomethingSelected,
  userRole,
  toggleSelectAll,
  selectedItems,

  onAddItem,
  onDeleteSelected,
  onViewSelected,
  onExtraInfo,
}) {
  const [title, setTitle] = useState("Proveedores");
  return (
    <div className="d-flex justify-content-between align-items-center header">
      <div className="d-flex align-items-center">
        <TitleDropdown currentTitle={title} setTitle={setTitle} />
        <div className="user-role">&lt;{userRole}&gt;</div>
      </div>

      <div className="btn-group">
        <button
          type="button"
          className="btn btn-primary add-product-button"
          title="Agregar producto"
          onClick={onAddItem}
        >
          <i className="bi bi-plus-circle-fill"></i>
        </button>

        <button
          type="button"
          className="btn btn-danger remove-products-button"
          title="Eliminar productos seleccionados"
          onClick={onDeleteSelected}
          disabled={!isSomethingSelected}
        >
          <i className="bi bi-trash-fill"></i>
        </button>

        <button
          type="button"
          className="btn btn-primary"
          title={
            isSomethingSelected ? "Deseleccionar todos" : "Seleccionar todos"
          }
          onClick={toggleSelectAll}
        >
          {isSomethingSelected ? (
            <i className="bi bi-square-fill"></i>
          ) : (
            <i className="bi bi-check-square-fill"></i>
          )}
        </button>

        <button
          type="button"
          className="btn btn-primary position-relative view-selected-products"
          title="Ver productos seleccionados"
          onClick={onViewSelected}
          disabled={!isSomethingSelected}
        >
          <i className="bi bi-eye-fill"></i>
          {selectedItems.size > 0 && (
            <span className="notification-badge">{selectedItems.size}</span>
          )}
        </button>

        <button
          type="button"
          className="btn btn-primary more-info"
          title="Información adicional"
          onClick={onExtraInfo}
          disabled={selectedItems.size !== 1}
        >
          <i className="bi bi-info-circle-fill"></i>
        </button>
      </div>
    </div>
  );
}
