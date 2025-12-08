import React from "react";
import Pagination from "../inventory/Pagination.jsx";
import Search from "../inventory/Search.jsx";
import Table from "../crud/Table.jsx";
import '../../css/providers.css';
import { useState, useEffect } from "react";
import Header from "../crud/Header.jsx"
import { fetchProviders_by_page, deleteProviderById } from "../../services/axios.services.js";
import { useUser } from "../../context/UserContext.jsx"
import ConfirmationModal from "../crud/ConfirmationModal.jsx"
import { useNotifications } from "../../context/NotificationSystem.jsx";
import RequirePermission from '../permissions_manager/PermissionVerifier.jsx'
import InfoFormContent from "./forms/InfoFormContent.jsx";
import AddItemContent from "./forms/AddItemContent.jsx";
import { addProvider, updateProvider } from "../../services/axios.services.js";

function Providers() {
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState([])
    const [selectedItems, setSelectedItems] = useState(new Map());
    const [isSomethingSelected, setIsSomethingSelected] = useState(false)
    const [isSearching, setIsSearching] = useState(false);
    const { user } = useUser();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationText, setConfirmationText] = useState('')
    const [confirmationTitle, setConfirmationTitle] = useState('')



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
    const reloadPageOne = () => {
        if (currentPage === 1) {
            setCurrentPage(2);
            setTimeout(() => setCurrentPage(1), 50);
        } else {
            setCurrentPage(1);
        }
        setLoading(true);
        setTimeout(() => setLoading(false), 0);
    }

    return (
        <RequirePermission permission="access_providers">
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
                            isSomethingSelected={isSomethingSelected}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            user={user}
                            items={providers}
                            deleteItem={deleteProviderById}
                            selectedItemsColumns={importantColumns}
                            reloadPageOne={reloadPageOne}
                            onSubmitAddItem={addProvider}
                            onSubmitEditItem={updateProvider}
                            titleAddItem={'Añadir un nuevo proveedor'}
                            AddItemcontent={AddItemContent}
                            InfoFormContent={InfoFormContent}
                            titleInfoForm={'Informacion del producto (editar)'}
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
        </RequirePermission>
    );
}
export default Providers;