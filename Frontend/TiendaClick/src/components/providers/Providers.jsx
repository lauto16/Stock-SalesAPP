import Pagination from "../inventory/Pagination.jsx";
import Table from "../crud/Table.jsx";
import '../../css/providers.css';
import { useState, useEffect } from "react";
import Header from "../crud/Header.jsx"
import { fetchProvidersByPage, deleteProviderById } from "../../services/axios.services.providers.js";
import { useUser } from "../../context/UserContext.jsx"
import RequirePermission from '../permissions_manager/PermissionVerifier.jsx'
import InfoFormContent from "./forms/InfoFormContent.jsx";
import AddItemContent from "./forms/AddItemContent.jsx";
import { addProvider, updateProvider } from "../../services/axios.services.providers.js";
import useReload from "../crud/hooks/useReload.js";
function Providers() {
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState([])
    const [selectedItems, setSelectedItems] = useState(new Map());
    const [isSomethingSelected, setIsSomethingSelected] = useState(false)
    const { user } = useUser();
    const { reload, reloadHandler } = useReload();
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
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await fetchProvidersByPage({
                page: currentPage,
                setLoading,
                token: user.token
            });

            setProviders(data.results);
            setTotalPages(Math.ceil(data.count / PAGE_SIZE));
            setLoading(false);
        };

        fetchData();
    }, [currentPage, reload]);

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


    return (
        <RequirePermission permission="access_providers">
            <div className="d-flex justify-content-center mt-5">
                <div className="container">
                    <div className="table-container-providers">

                        <Header
                            notModifyItem={false}
                            title={"PROVEEDORES"}
                            isSomethingSelected={isSomethingSelected}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            user={user}
                            items={providers}
                            deleteItem={deleteProviderById}
                            selectedItemsColumns={importantColumns}
                            reload={reloadHandler}
                            onSubmitAddItem={addProvider}
                            onSubmitEditItem={updateProvider}
                            titleAddItem={'Añadir nuevo proveedor'}
                            AddItemcontent={AddItemContent}
                            InfoFormContent={InfoFormContent}
                            titleInfoForm={'Informacion del producto (editar)'}
                            displayName={'Proveedor'}
                        />

                        <div className="d-flex justify-content-center align-items-center mb-3 flex-wrap">

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
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