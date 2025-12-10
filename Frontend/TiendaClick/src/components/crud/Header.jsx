import { Dropdown, ButtonGroup } from "react-bootstrap";
import AddItemModal from "../crud/AddItemModal.jsx"
import { useState } from "react";
import TitleDropdown from "../global/TitleDropdown.jsx";
import { useNotifications } from '../../context/NotificationSystem.jsx';
import ConfirmationModal from "../crud/ConfirmationModal.jsx";
import { useModal } from "./hooks/useModal.js";
import SelectedItemsModal from "../crud/SelectedItemsModal.jsx";
import Table from "./Table.jsx";
export default function Header({
  title,
  isSomethingSelected,
  selectedItems,
  setSelectedItems,
  items,
  user,
  onExtraInfo,
  extraButtons = [],
  deleteItem,
  selectedItemsColumns = [{}],
  reloadPageOne = () => { },
  titleAddItem,
  AddItemcontent = () => { },
  onSubmitAddItem,
  onSubmitEditItem,
  InfoFormContent,
  titleInfoForm
}) {
  const [showAddItem, setShowAddItem] = useState(false);
  const { addNotification } = useNotifications();
  //Delete modal
  const {
    title: titleDelete,
    message: messageDelete,
    show: showDelModal,
    openModal: openDelModal,
    closeModal: closeDelModal,
  } = useModal()
  //Select Items Modal
  const {
    title: titleSelect,
    show: showSelect,
    openModal: openSelect,
    closeModal: closeSelect,
  } = useModal()

  //Select Items Modal
  const {
    title: titleInfo,
    show: showInfo,
    openModal: openInfo,
    closeModal: closeInfo,
  } = useModal()


  //delete logic
  const prepareDelete = () => {
    if (selectedItems.size === 0) return;

    const selectedArray = Array.from(selectedItems.values());
    const itemsToShow = selectedArray.slice(0, 5);
    const extraCount = selectedArray.length - 5;

    // Create table with selected items
    const tableContent = (
      <>
        <Table
          columns={selectedItemsColumns}
          items={itemsToShow}
          showHeader={false}
        />
        {/* <table className="table table-striped table-bordered">
          <tbody>
            {itemsToShow.map((item, index) => (
              <tr key={index}>
                <td>{item.name || `Venta #${item.id}`}</td>
                <td>{item.created_at || '-'}</td>
                <td>{item.total_price ? `$${item.total_price}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {extraCount > 0 && (
          <p className="text-muted">... y {extraCount} elemento{extraCount > 1 ? 's' : ''} más.</p>
        )} */}

      </>
    );

    openDelModal("Eliminar elementos seleccionados...", tableContent);
  };

  const handleDelete = async () => {
    const itemsToDelete = Array.from(selectedItems.values()).map(item => ({
      name: item.name,
      id: item.code ?? item.id,
      displayName: item.name || `Venta #${item.id}`
    }));

    for (let { id, displayName } of itemsToDelete) {
      const result = await deleteItem(id, user.token);
      console.log(result)
      if (result?.success) {
        addNotification("success", `"${displayName}" eliminado con éxito`);

      } else {
        const message = result?.error || `"${displayName}" no se pudo eliminar`;
        addNotification("error", message);
      }
    }

    setSelectedItems(new Map());
    closeDelModal();
    reloadPageOne();
  };

  //Select All button
  const toggleSelectAll = () => {
    if (isSomethingSelected) {
      setSelectedItems(new Map());
    } else {
      const newSelected = new Map();
      items.forEach(item => {
        newSelected.set(item.code ?? item.id, item);
      });
      setSelectedItems(newSelected);
    }
  };

  //Show all the items selected Modal
  return (
    <div className="d-flex justify-content-between align-items-center header">
      {/* modals */}
      {/* shows selected products */}
      <SelectedItemsModal
        show={showSelect}
        handleClose={closeSelect}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        columns={selectedItemsColumns}
      />
      {/* opens a form to add an Item */}
      <AddItemModal show={showAddItem} handleClose={setShowAddItem} onSubmitHandler={onSubmitAddItem}
        Content={AddItemcontent} title={titleAddItem} reloadPageOne={reloadPageOne} />

      {/* enables to delete a set of Items */}
      <ConfirmationModal
        show={showDelModal}
        handleClose={closeDelModal}
        title={titleDelete}
        message={messageDelete}
        onSendForm={handleDelete}
      />
      {/* Items Info Modal if onExtraInfo is not defined*/}

      {!onExtraInfo ? <AddItemModal show={showInfo}
        onSubmitHandler={onSubmitEditItem}
        handleClose={closeInfo}
        selectedItems={selectedItems}
        Content={InfoFormContent}
        title={titleInfoForm}
        reloadPageOne={reloadPageOne}
      /> : <></>
      }
      <div className="d-flex align-items-center">
        <TitleDropdown currentTitle={title} />
        <div className="user-role"><strong>{user?.role}</strong></div>
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
          onClick={openSelect}
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
          //if onExtraInfo Prop is defined, use a specific modal 
          //defined on the parent component, otherwise openInfo Modal
          onClick={onExtraInfo ?? openInfo}
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
