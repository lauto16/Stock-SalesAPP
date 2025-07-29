export default function Header({
  isSomethingSelected,
  userRole,
  onAddProduct,
  onDeleteSelected,
  toggleSelectAll,
  selectedItems,
  onViewSelected,
  onExtraInfo
}) {
  return (
    <div className="d-flex justify-content-between align-items-center header">
      <div className="d-flex align-items-center">
        <h1 className="title">INVENTARIO</h1>
        <div className="user-role">&lt;{userRole}&gt;</div>
      </div>

      <div className="btn-group">
        <button
          type="button"
          className="btn btn-primary add-product-button"
          title="Agregar producto"
          onClick={onAddProduct}
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
          title={isSomethingSelected ? "Deseleccionar todos" : "Seleccionar todos"}
          onClick={toggleSelectAll}
        >
          {isSomethingSelected
            ? <i className="bi bi-check-square-fill"></i>
            : <i className="bi bi-square-fill"></i>}
        </button>

        <button
          type="button"
          className="btn btn-primary position-relative"
          title="Ver productos seleccionados"
          onClick={onViewSelected}
          disabled={!isSomethingSelected}
        >
          <i className="bi bi-eye-fill"></i>

          {selectedItems.size > 0 && (
            <span className="notification-badge">
              {selectedItems.size}
            </span>
          )}
        </button>

        <button
          type="button"
          className="btn btn-primary"
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