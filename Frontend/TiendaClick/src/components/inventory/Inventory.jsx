import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header";
import Table from "./Table.jsx";
import Pagination from "./Pagination";
import "../../css/inventory.css";
import Search from "./Search";
import Product from "./Product";
import AddProductModal from "./AddProductModal";

export default function InventoryPage() {
    const userRole = "admin";
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([])
    const [showModal, setShowModal] = useState(false);

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
    const fetchProducts = (page, search = "") => {
        setLoading(true);
        axios
            .get(`${apiUrl}?page=${page}&search=${search}`)
            .then((response) => {
                setItems(response.data.results);
                setTotalPages(Math.ceil(response.data.count / PAGE_SIZE));
                setCurrentPage(page);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error al obtener el inventario:", error);
                setLoading(false);
            });
    };

    const handleSearchSubmit = () => {
        console.log("Buscando:", searchInput);
        setSearchQuery(searchInput);
    };

    useEffect(() => {
        fetchProducts(1, searchQuery);
    }, [searchQuery]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchProducts(page, searchQuery);
        }
    };

    const handleGoToSales = (page) => {
        //to implement
    }

    const unselectProduct = (e, code) => {
        const row = e.currentTarget;
        const selectedProductsAux = selectedProducts.filter(c => c !== code);
        setSelectedProducts(selectedProductsAux);
        row.classList.remove('selected-product');
    };

    const selectProduct = (e, code) => {
        const selectedProductsAux = [...selectedProducts];
        const row = e.currentTarget;
        if (!selectedProductsAux.includes(code)) {
            selectedProductsAux.push(code);
            setSelectedProducts(selectedProductsAux);
            row.classList.add('selected-product');
        }
        else {
            unselectProduct(e, code)
        }
    };


    useEffect(() => {
        console.log(selectedProducts);
    }, [selectedProducts]);

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
                    <Table items={items} columns={columns} loading={loading} />
                </div>
            </div>
        </div>


    );
}