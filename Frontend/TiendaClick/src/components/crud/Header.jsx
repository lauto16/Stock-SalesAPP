import { Dropdown, ButtonGroup } from "react-bootstrap";
import AddItemModal from "../crud/AddItemModal.jsx"
import { useState } from "react";
import TitleDropdown from "../global/TitleDropdown.jsx";
import { useNotifications } from '../../context/NotificationSystem.jsx';
import ConfirmationModal from "../crud/ConfirmationModal.jsx";
export default function Header({
  title,
  isSomethingSelected,
  selectedItems,
  setSelectedItems,
  items,
  user,
  onViewSelected,
  onExtraInfo,
  extraButtons = [],
  addFormConfig,
  deleteItem
}) {
  const [showAddItem, setShowAddItem] = useState(false);
  const { addNotification } = useNotifications();

  const [titleDelete, setTitleDelete] = useState("");
  const [messageDelete, setMessageDelete] = useState("");
  const [showDelModal, setShowDelModal] = useState(false);

  //delete logic
  const prepareDelete = () => {
    if (selectedItems.size === 0) return;
    //because selectedItems items its a Map 
    const previewList = Array.from(selectedItems.values())
      .slice(0, 5)
      .map(item => `• ${item.name}(${item.code ?? item.id})`)
      .join('\n');
    const extraCount = selectedItems.length - 5;

    const message = extraCount > 0
      ? `${previewList}\n...y ${extraCount} más.`
      : previewList;

    setTitleDelete("Eliminar Productos...");
    setMessageDelete(message);
    setShowDelModal(true);
  };

  const handleDelete = async () => {

    const itemsToDelete = Array.from(selectedItems.values()).map(item => ({
      name: item.name,
      id: item.code ?? item.id
    }));
    for (const { id, name } of itemsToDelete) {
      try {
        const result = await deleteItem(id, user.token);
        if (result?.success) {
          addNotification("success", `"${name}" eliminado con éxito`);
          setTimeout(() => {
            window.location.reload();
          }, 200);
        } else {
          addNotification("error", `"${name}" no se pudo eliminar`);
        }
      } catch (error) {
        console.error(error);
        addNotification("error", `Error al eliminar "${name}"`);
      }
    }
    setSelectedItems(new Map());
    setShowDelModal(false);
  };


  const toggleSelectAll = () => {
    if (isSomethingSelected) {
      setSelectedItems(new Map());
    } else {
      const newSelected = new Map();
      items.forEach(item => {
        newSelected.set(item.code, item);
      });
      setSelectedItems(newSelected);
    }
  };

  return (
    <div className="d-flex justify-content-between align-items-center header">
      {/* modals */}

      <AddItemModal show={showAddItem} handleClose={setShowAddItem} formConfig={addFormConfig.config} onSubmitHandler={addFormConfig.handleSubmit} />
      <div className="d-flex align-items-center">
        <TitleDropdown currentTitle={title} />
        <div className="user-role">&lt;{user?.role}&gt;</div>
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
          onClick={prepareDelete}
          disabled={!isSomethingSelected}
        >
          <i className="bi bi-trash-fill"></i>

        </button>
        {/* delete */}
        <ConfirmationModal
          show={showDelModal}
          handleClose={() => setShowDelModal(false)}
          title={titleDelete}
          message={messageDelete}
          onSendForm={handleDelete}
        />
        <button
          type="button"
          className="btn btn-primary"
          title={
            isSomethingSelected ? "Deseleccionar todos" : "Seleccionar todos"
          }
          onClick={toggleSelectAll}
        >
          {isSomethingSelected ? (
            <i className="bi bi-check-square-fill"></i>
          ) : (
            <i className="bi bi-square-fill"></i>
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

        <Dropdown className="dropdown-more-options" as={ButtonGroup}>
          {extraButtons.length !== 0 ? (
            <>
              <Dropdown.Toggle split variant="primary" title="Más acciones">
                <i className="bi bi-list"></i>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {extraButtons.map((button, index) => (
                  <Dropdown.Item
                    key={index}
                    onClick={button.action}
                    disabled={
                      button.SomethingSelectedNeeded && !isSomethingSelected
                    }
                  >
                    <i className={button.icon}></i>
                    {button.title}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </>
          ) : (
            <></>
          )}
        </Dropdown>
      </div>
    </div>
  );
}
