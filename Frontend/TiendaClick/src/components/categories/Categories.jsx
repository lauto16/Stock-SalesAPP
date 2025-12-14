import RequirePermission from '../permissions_manager/PermissionVerifier.jsx'
import { fetchCategories, addCategory, updateCategory } from '../../services/axios.services.js'
import { useEffect, useState } from 'react'
import { useUser } from "../../context/UserContext.jsx";
import Header from '../crud/Header.jsx';
import Table from '../crud/Table.jsx';
import Pagination from '../inventory/Pagination.jsx';
import AddCategoryContent from './forms/AddCategoryContent.jsx';
import InfoCategoryContent from './forms/InfoCategoryContent.jsx';

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

    const columns = [
        { className: "name", key: "name", label: 'Nombre' },
        { className: "percentage", key: "percentage", label: 'Porcentaje Descuento' },
        { className: "end_date", key: "end_date", label: 'Finaliza' },
        { className: "created_at", key: "created_at", label: 'Creada' },
    ];

    //selectedItemsColums
    const importantColumns = [
        { className: "name", key: "name", label: 'Nombre' },
        { className: "percentage", key: "percentage", label: 'Porcentaje Descuento' },
        { className: "end_date", key: "end_date", label: 'Finaliza' },
    ];

    useEffect(() => {
        const loadcategories = async () => {
            const { results, count } = await fetchCategories({
                page: 1,
                setLoading,
                token: user.token,
            });
            setCategories(results.categories);

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
                            title={"CATEGORIAS"}
                            isSomethingSelected={isSomethingSelected}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            user={user}
                            items={categories}
                            selectedItemsColumns={importantColumns}
                            reloadPageOne={() => setCurrentPage(1)}
                            onSubmitAddItem={addCategory}
                            onSubmitEditItem={updateCategory}
                            titleAddItem={'Añadir una nueva categoria'}
                            AddItemcontent={AddCategoryContent}
                            InfoFormContent={InfoCategoryContent}
                            titleInfoForm={'Informacion de la categoria (editar)'}
                            disabledDeleteButton={true}
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
                            pkName={'name'}
                        />

                    </div>
                </div>
            </div>
        </RequirePermission>
    )
}