import React from "react";
import Pagination from "../inventory/Pagination.jsx";
import Search from "../inventory/Search.jsx";
import Table from "../crud/Table.jsx";
import '../../css/providers.css';
import { useState, useEffect, useRef } from "react";
import Header from "../crud/Header.jsx"
import { fetchProviders_by_page, fetchProvidersById, addProvider, deleteProviderById } from "../../services/axios.services.js";
import { useUser } from "../../context/UserContext.jsx"

// import ItemInfoModal from "./ItemInfoModal.jsx"
import ConfirmationModal from "../crud/ConfirmationModal.jsx"
import { useNotifications } from "../../context/NotificationSystem.jsx";
import addProviderConfig from "./forms/AddProviderConfig.js";

function Providers() {
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState([])
    const [selectedItems, setSelectedItems] = useState(new Map());
    const [isSomethingSelected, setIsSomethingSelected] = useState(false)
    const [isSearching, setIsSearching] = useState(false);
    const { user } = useUser();
    const { addNotification } = useNotifications();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationText, setConfirmationText] = useState('')
    const [confirmationTitle, setConfirmationTitle] = useState('')

    //AddProvider
    const addItemConfig = {
        config: addProviderConfig,
        handleSubmit: addProvider
    }


    const PAGE_SIZE = 10;
    const columns = [
        { className: "name", key: "name", label: 'Nombre' },
        { className: "phone", key: "phone", label: 'Teléfono' },
        { className: "email", key: "email", label: 'Mail' },
        { className: "address", key: "address", label: 'Dirección' },
    ];

    //selectedItemsColums
    const importantColumns = [
        { className: "name", key: "name", label: 'Nombre' },
        { className: "phone", key: "phone", label: 'Teléfono' },
    ];

    const ACTIONS = {
        DELETE: 'DELETE',
        UPDATE: 'UPDATE'
    }
    //modals

    const handleHideConfirmation = () => setShowConfirmation(false);


    useEffect(() => {
        const fetchData = async () => {
            if (isSearching) return;
            setLoading(true);
            const data = await fetchProviders_by_page({
                page: currentPage,
                setLoading,
                token: user.token
            });

            setProviders(data.results);
            setTotalPages(Math.ceil(data.count / PAGE_SIZE));
            setLoading(false);
        };

        fetchData();
    }, [currentPage, isSearching]);

    useEffect(() => {
        if (selectedItems.size !== 0) {
            setIsSomethingSelected(true)
        } else {
            setIsSomethingSelected(false)
        }
    })

    const handlePageChange = (page) => {

        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }

    };

    const unselectAll = () => {
        if (isSomethingSelected) {
            setSelectedItems(new Map());
        }
    }

    const onAddItem = () => {

    }
    const handleSearchSubmit = async (query) => {
        if (query.length >= 2) {
            setIsSearching(true);
            setSearchQuery(query);
            setCurrentPage(1);
            setLoading(true);
            const results = await fetchSearchProducts(query);
            setAllSearchResults(results);
            setLoading(false);
        }
    };
    const handleCreateProvider = async (query) => {
        console.log("provider creado")
    }

    const toggleSelectAll = () => {
        if (isSomethingSelected) {
            setSelectedItems(new Map());
        } else {
            const newSelected = new Map();
            items.forEach(item => {
                newSelected.set(item.id, item);
            });
            setSelectedItems(newSelected);
        }
    };

    const onExtraInfo = async () => {
        const firstSelected = Array.from(selectedItems.values())[0];

        if (selectedItems.size === 0) {
            addNotification("warning", "Selecciona un producto para ver su información.");
            return;
        }

        if (!firstSelected || !firstSelected.code) {
            addNotification("warning", "Selecciona un producto válido para ver su información.");
            return;
        }

        try {
            const data = await fetchProvidersById(firstSelected.id);
            setSelectedProduct({
                ...data,
            });

            setShowProductInfo(true);
        } catch (error) {
            addNotification("error", "No se pudo obtener la información del producto.");
            console.error("Error al obtener producto:", error);
        }
    };

    return (
            <div className="d-flex justify-content-center mt-5">
                <div className="container">

                    <ConfirmationModal
                        show={showConfirmation}
                        onHide={handleHideConfirmation}
                        title={confirmationTitle}
                        message={confirmationText}
                        onSendForm={handleCreateProvider}
                        handleClose={handleHideConfirmation}
                    />

                    <div className="table-container-providers">

                        <Header
                            title={"PROVEEDORES"}
                            selectedItems={selectedItems}
                            isSomethingSelected={isSomethingSelected}
                            setSelectedItems={setSelectedItems}

                            user={user}
                            items={providers}
                            onExtraInfo={onExtraInfo}
                            onViewSelected={() => setShowSelectedModal(true)}
                            addFormConfig={addItemConfig}
                            deleteItem={deleteProviderById}
                            selectedItemsColumns={importantColumns}
                        />

                        <div className="d-flex justify-content-center align-items-center mb-3 flex-wrap">

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />

                            <div className="search-wrapper">
                                <Search />
                            </div>
                        </div>
                        <Table items={providers}
                            columns={columns}
                            loading={loading}
                            setLoading={setLoading}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            pkName={'id'}
                        />

                    </div>
                </div>
            </div>
    );
}
export default Providers;