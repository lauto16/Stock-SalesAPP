import { useEffect, useState } from "react";
import axios from "axios";

import Header from "./Header";
import TableHeader from "./TableHeader";
import Pagination from "./Pagination";
import "../../css/inventory.css";
import Search from "./Search";

export default function InventoryPage() {
    const userRole = "admin";
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const PAGE_SIZE = 10;
    const apiUrl = `http://${window.location.hostname}:8000/api/products/`;

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
        console.log('test');

    }

    return (
        <div className="d-flex justify-content-center mt-5">
            <div className="container container-modified">
                <Header userRole={userRole} onGoToSales={handleGoToSales} />
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

                    <table className="table table-bordered align-middle">
                        <TableHeader />
                        <tbody id="table-body">
                            {loading ? (
                                <tr>
                                    <td colSpan="6">Cargando inventario...</td>
                                </tr>
                            ) : (
                                items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="col-code">{item.code}</td>
                                        <td className="col-name">{item.name}</td>
                                        <td className="col-sell-price">${item.sell_price}</td>
                                        <td className="col-buy-price">${item.buy_price}</td>
                                        <td className="col-stock">{item.stock}</td>
                                        <td className="col-last-modification">{item.last_modification}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>


    );
}