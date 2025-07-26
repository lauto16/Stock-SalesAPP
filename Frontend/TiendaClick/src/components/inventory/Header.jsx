export default function Header({ userRole, onAddProduct, onDeleteSelected, onSelectAll, onDeselectAll, onViewSelected }) {
  return (
    <div className="d-flex justify-content-between align-items-center header">
      <div className="d-flex align-items-center">
        <h1 className="title">INVENTARIO</h1>
        <div className="user-role">&lt;{userRole}&gt;</div>
      </div>

      <div className="btn-group">
        <button type="button" className="btn btn-primary add-product-button" title="Agregar producto" onClick={onAddProduct}>
          <i className="bi bi-plus-circle-fill"></i>
        </button>
        <button type="button" className="btn btn-danger remove-products-button" title="Eliminar productos seleccionados" onClick={onDeleteSelected}>
          <i className="bi bi-trash-fill"></i>
        </button>
        <button type="button" className="btn btn-primary" title="Seleccionar todos" onClick={onSelectAll}>
          <i className="bi bi-check-square-fill"></i>
        </button>
        <button type="button" className="btn btn-primary" title="Deseleccionar todos" onClick={onDeselectAll}>
          <i className="bi bi-square-fill"></i>
        </button>
        <button type="button" className="btn btn-primary" title="Ver productos seleccionados" onClick={onViewSelected}>
          <i className="bi bi-eye-fill"></i>
        </button>
        <button type="button" className="btn btn-primary" title="Información adicional" onClick={() => alert('Info extra')}>
          <i className="bi bi-info-circle-fill"></i>
        </button>
      </div>

    </div>
  );
}