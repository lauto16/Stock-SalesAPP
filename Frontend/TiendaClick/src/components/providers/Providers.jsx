import React from "react";
import Pagination from "../inventory/Pagination.jsx";
import Search from "../inventory/Search.jsx";
import Table from "../inventory/Table.jsx";
import '../../css/providers.css';
import { useState, useEffect, useRef } from "react";
import SideBar from "../sideNav/SideBar.jsx";
import Footer from "../footer/Footer.jsx"
import Nav from "../sideNav/Nav.jsx"
import { fetchProviders } from "../../services/axios.services.js";
function Providers() {
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState([])
    const [selectedItems, setSelectedItems] = useState(new Map());
    const [isSomethingSelected, setIsSomethingSelected] = useState(false)
    const [isSearching, setIsSearching] = useState(false);

    const PAGE_SIZE = 10;
    const columns = [
        { className: "name", key: "name", label: 'Nombre' },
        { className: "phone", key: "phone", label: 'Teléfono' },
        { className: "email", key: "email", label: 'Mail' },
        { className: "address", key: "address", label: 'Dirección' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            if (isSearching) return;
            setLoading(true);
            const data = await fetchProviders({
                page: currentPage,
                setLoading,
            });
            console.log(data);

            setProviders(data);
            setTotalPages(Math.ceil(data.count / PAGE_SIZE));
            setLoading(false);
        };

        fetchData();
    }, [currentPage, isSearching]);

    const handlePageChange = (page) => {

        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }

    };

    return (
        <div className="app-wrapper">
            <SideBar />
            <Nav />
            <main className="flex-grow-1 p-3 content">
                <div className="d-flex justify-content-center mt-5">
                    <div className="container">
                        <div className="table-container-providers">
                            <div className="d-flex justify-content-between align-items-center header">
                                <h1>Proveedores</h1>

                            </div>

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
                            <Table items={providers} columns={columns} loading={loading} setLoading={setLoading} />

                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
export default Providers;