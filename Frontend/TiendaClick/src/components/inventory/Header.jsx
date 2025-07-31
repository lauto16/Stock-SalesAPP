import { Dropdown, ButtonGroup } from "react-bootstrap";
import AddItemModal from "./AddProductModal.jsx"
import { useState } from "react";
export default function Header({
  title,
  isSomethingSelected,
  userRole,
  onDeleteSelected,
  toggleSelectAll,
  selectedItems,
  onViewSelected,
  onExtraInfo,
  extraButtons = [],
  onPriceUpdate,
  onTemporaryOffer,

}) {
  const [showAddItem, setShowAddItem] = useState(false)

  return (

    <div className="d-flex justify-content-between align-items-center header">
      {/* modals */}
      <AddItemModal show={showAddItem} handleClose={setShowAddItem} title={'Agregar Producto'} />

      <div className="d-flex align-items-center">
        <h1 className="title">{title}</h1>
        <div className="user-role">&lt;{userRole}&gt;</div>
      </div>

      <div className="btn-group">
        <button
          type="button"
          className="btn btn-primary add-product-button"
          title="Agregar producto"
          onClick={() => setShowAddItem(true)}
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
          className="btn btn-primary position-relative view-selected-products"
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
          className="btn btn-primary more-info"
          title="Información adicional"
          onClick={onExtraInfo}
          disabled={selectedItems.size !== 1}
        >
          <i className="bi bi-info-circle-fill"></i>
        </button>

        <Dropdown className="dropdown-more-options" as={ButtonGroup}>
          {extraButtons.length !== 0 ?
            <><Dropdown.Toggle
              split
              variant="primary"
              title="Más acciones"
            >
              <i className="bi bi-list"></i>
            </Dropdown.Toggle>

              <Dropdown.Menu>
                {extraButtons.map((button, index) => (
                  <Dropdown.Item
                    key={index}
                    onClick={button.action}
                    disabled={button.SomethingSelectedNeeded && !isSomethingSelected}
                  >
                    <i className={button.icon}></i>
                    {button.title}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu></>
            : <></>
          }
        </Dropdown>
      </div>
    </div>
  );
}
