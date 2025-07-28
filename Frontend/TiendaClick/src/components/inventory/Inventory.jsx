import { useEffect, useState } from "react";
import Header from "./Header";
import Table from "./Table.jsx";
import Pagination from "./Pagination";
import "../../css/inventory.css";
import Search from "./Search";
import AddProductModal from "./AddProductModal";
import { fetchSearchProducts, fetchProducts, deleteProductByCode } from "../../services/axios.services.js";
import { useNotifications } from '../../context/NotificationSystem';

export default function InventoryPage() {
    const userRole = "admin";
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Map());
    const [isSearching, setIsSearching] = useState(false);
    const [allSearchResults, setAllSearchResults] = useState([]);
    const { addNotification } = useNotifications();

    const PAGE_SIZE = 10;

    const columns = [
        { className: "code", key: "code", label: 'Código' },
        { className: "name", key: "name", label: 'Nombre' },
        { className: "sell-price", key: "sell_price", label: 'Precio Venta' },
        { className: "buy-price", key: "buy_price", label: 'Precio Compra' },
        { className: "stock", key: "stock", label: 'Stock' },
        { className: "last-modification", key: "last_modification", label: 'Última Modificación' },
    ];

    const clearSearch = () => {
        setIsSearching(false);
        setSearchQuery("");
        setSearchInput("");
        setCurrentPage(1);
    };

    const handleDelete = async (codes) => {
    const newItems = [...items];

    for (const code of codes) {
        try {
            const result = await deleteProductByCode(code);
            if (result.success) {
                addNotification('success', `Producto ${code} eliminado con éxito`);

                const index = newItems.findIndex(item => item.code === code);
                if (index !== -1) {
                    newItems.splice(index, 1);
                }
            }
        } catch (error) {
            addNotification('error', `El producto ${code} no se pudo eliminar`);
        }
    }

    setItems(newItems); // actualizamos la tabla con los nuevos datos
    setSelectedItems(new Map()); // limpiamos selección
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

    useEffect(() => {
        const fetchData = async () => {
            if (isSearching) return;
            setLoading(true);
            const data = await fetchProducts({
                page: currentPage,
                search: "",
                setLoading,
            });
            setItems(data.results);
            setTotalPages(Math.ceil(data.count / PAGE_SIZE));
            setLoading(false);
        };

        fetchData();
    }, [currentPage, isSearching]);

    useEffect(() => {
        if (!isSearching) return;

        const total = Math.ceil(allSearchResults.length / PAGE_SIZE);
        setTotalPages(total);

        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const pageItems = allSearchResults.slice(start, end);
        setItems(pageItems);
    }, [allSearchResults, currentPage, isSearching]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false);
    const handleGoToSales = () => { };

    useEffect(() => {
        console.log(selectedItems);
    }, [selectedItems]);

    return (
        <div className="d-flex justify-content-center mt-5">
            <AddProductModal show={showModal} handleClose={handleClose} />
            <div className="container container-modified">
                <Header userRole={userRole} onGoToSales={handleGoToSales} onAddProduct={handleOpen} onDeleteSelected={(e) => handleDelete(Array.from(selectedItems.keys()))}/>
                <div className="table-container">
                    <div className="d-flex justify-content-center align-items-center mb-3 flex-wrap search-pag-container">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                        <div className="search-wrapper">
                            <Search
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onSearch={() => handleSearchSubmit(searchInput)}
                            />
                        </div>
                    </div>
                    <Table
                        items={items}
                        columns={columns}
                        loading={loading}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                    />
                    <button className="btn btn-outline-secondary clear-search-results-button" onClick={clearSearch}>
                        Limpiar resultados de busqueda
                    </button>

                </div>
            </div>
        </div>
    );
}
