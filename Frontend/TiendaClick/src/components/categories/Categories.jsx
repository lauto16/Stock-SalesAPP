import RequirePermission from '../permissions_manager/PermissionVerifier.jsx'
import { fetchCategories, addCategory, updateCategory, deleteCategory } from '../../services/axios.services.categories.js'
import { useEffect, useState } from 'react'
import { useUser } from "../../context/UserContext.jsx";
import Header from '../crud/Header.jsx';
import Table from '../crud/Table.jsx';
import Pagination from '../inventory/Pagination.jsx';
import AddCategoryContent from './forms/AddCategoryContent.jsx';
import InfoCategoryContent from './forms/InfoCategoryContent.jsx';
import { useNotifications } from '../../context/NotificationSystem';
import useReload from '../crud/hooks/useReload.js';

export default function Categories() {

    const { user } = useUser();
    const [categories, setCategories] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedItems, setSelectedItems] = useState(new Map());
    const [isSomethingSelected, setIsSomethingSelected] = useState(false);
    const PAGE_SIZE = 10;
    const { addNotification } = useNotifications();
    const [reload, reloadHandler] = useReload();
    const columns = [
        { className: "name", key: "name", label: 'Nombre' },
        { className: "description", key: "description", label: 'Descripción' },
    ];

    useEffect(() => {
        const loadcategories = async () => {
            const { success, error, data } = await fetchCategories(
                setLoading,
                user.token,
            );
            if (!success) {
                if (error) {
                    addNotification("error", error);
                }
                setCategories([]);
                setLoading(false);
                return;
            }
            setCategories(data);
            setCount(count);
            setTotalPages(Math.ceil(count / PAGE_SIZE));
            setLoading(false);
        };

        loadcategories();
    }, [currentPage]);

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
        <RequirePermission permission="access_inventory">
            <div className="d-flex justify-content-center mt-5">
                <div className="container">
                    <div className="table-container-providers">

                        <Header
                            notModifyItem={false}
                            title={"CATEGORIAS"}
                            isSomethingSelected={isSomethingSelected}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            user={user}
                            items={categories}
                            selectedItemsColumns={columns}
                            reload={reloadHandler}
                            onSubmitAddItem={addCategory}
                            onSubmitEditItem={updateCategory}
                            titleAddItem={'Añadir nueva categoria'}
                            AddItemcontent={AddCategoryContent}
                            InfoFormContent={InfoCategoryContent}
                            titleInfoForm={'Informacion de la categoria (editar)'}
                            deleteItem={deleteCategory}
                            displayName={'Categoria'}
                        />

                        <div className="d-flex justify-content-center align-items-center mb-3 flex-wrap">

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                        <Table items={categories}
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
    )
}