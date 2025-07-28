import { useEffect, useState } from "react";
import Header from "./Header";
import Table from "./Table.jsx";
import Pagination from "./Pagination";
import "../../css/inventory.css";
import Search from "./Search";
import AddProductModal from "./AddProductModal";
import { fetchProducts } from "../../services/axios.services.js";
import { set } from "react-hook-form";

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
    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const PAGE_SIZE = 10;
    const apiUrl = `http://${window.location.hostname}:8000/api/products/`;

    const columns = [
        { className: "code", key: "code", label: 'Código' },
        { className: "name", key: "name", label: 'Nombre' },
        { className: "sell-price", key: "sell_price", label: 'Precio Venta' },
        { className: "buy-price", key: "buy_price", label: 'Precio Compra' },
        { className: "stock", key: "stock", label: 'Stock' },
        { className: "last-modification", key: "last_modification", label: 'Última Modificación' },
    ];

    const handleSearchSubmit = () => {
        console.log("Buscando:", searchInput);
        setSearchQuery(searchInput);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchProducts({
                    page: currentPage,
                    search: searchQuery,
                    setLoading,
                });
                setItems(data.results);
                setTotalPages(Math.ceil(data.count / PAGE_SIZE));
            } catch (error) {
                setItems([]);
            }
        };

        fetchData();
    }, [searchQuery, currentPage]);


    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleGoToSales = (page) => {
        //to implement
    }

    useEffect(() => {
        console.log(selectedItems)
    }, [selectedItems]);

    return (
        <div className="d-flex justify-content-center mt-5">
            <AddProductModal show={showModal} handleClose={handleClose} />
            <div className="container container-modified">
                <Header userRole={userRole} onGoToSales={handleGoToSales} onAddProduct={handleOpen} />
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
                                onSearch={handleSearchSubmit}
                            />
                        </div>
                    </div>
                    <Table items={items} columns={columns} loading={loading} selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
                </div>
            </div>
        </div>


    );
}