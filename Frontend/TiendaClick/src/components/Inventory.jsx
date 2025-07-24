import { useEffect, useState } from "react";
import axios from "axios";

import Header from "../components/Header";
import TableHeader from "../components/TableHeader";
import Pagination from "../components/Pagination";
import "../inventory.css";

export default function InventoryPage() {
    const userRole = "admin";
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const PAGE_SIZE = 10;
    const apiUrl = `http://${window.location.hostname}:8000/api/products/`;

    const fetchProducts = (page) => {
        setLoading(true);
        axios
            .get(`${apiUrl}?page=${page}`)
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

    useEffect(() => {
        fetchProducts(1);
    }, []);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchProducts(page);
        }
    };

    const handleGoToSales = (page) => {
        console.log('test');

    }

    return (
        <div className="d-flex justify-content-center mt-5">
            <div className="container">
                <Header userRole={userRole} onGoToSales={handleGoToSales} />
                <div className="table-container">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
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
                                        <td>{item.code}</td>
                                        <td>{item.name}</td>
                                        <td>${item.sell_price}</td>
                                        <td>${item.buy_price}</td>
                                        <td>{item.stock}</td>
                                        <td>{item.last_modification}</td>
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