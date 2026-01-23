import { useEffect, useState } from "react";
import Header from "../crud/Header.jsx";
import Table from "../crud/Table.jsx";
import Pagination from "../inventory/Pagination.jsx";
import "../../css/inventory.css";
import Search from "../inventory/Search.jsx";
/*import {

} from "../../services/axios.services.js";*/
import { useUser } from "../../context/UserContext.jsx";
import { useNotifications } from "../../context/NotificationSystem";
import RequirePermission from "../permissions_manager/PermissionVerifier.jsx";
//import AddSaleContent from "./forms/AddSaleContent.jsx";
//import InfoFormContent from "./forms/InfoFormContent.jsx";

export default function Entries() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [selectedItems, setSelectedItems] = useState(new Map());
    const [isSomethingSelected, setIsSomethingSelected] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [allSearchResults, setAllSearchResults] = useState([]);
  
    const { user } = useUser();
    const { addNotification } = useNotifications();
  
    const PAGE_SIZE = 10;
  
    const columns = [
      { className: "total", key: "total", label: "Total pagado" },
      { className: "created_at", key: "created_at", label: "Fecha" },
    ];
  
    /* =======================
       FORMAT HELPERS
       ======================= */
  
    const formatDate = (isoString) => {
      if (!isoString) return "";
      return isoString.slice(0, 10).replaceAll("-", "/");
    };
  
    const formatHour = (isoString) => {
      if (!isoString) return "";
      return new Date(isoString).toLocaleTimeString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    };
  
    /* =======================
       FETCH NORMAL
       ======================= */
  
    /*useEffect(() => {
      if (isSearching) return;
  
  
      const fetchData = async () => {
        setLoading(true);
        try {
          const data = await fetchSales({ page: currentPage, setLoading: setLoading, token: user.token });
          if (!data.results) {
            return
          }
          const results = data?.results.map((sale) => {
            return {
              ...sale,
              full_date: sale.created_at ? formatDate(sale.created_at) : "",
              hour: sale.created_at ? formatHour(sale.created_at) : "",
            };
          });
  
          setItems(formatSalesData(results));
          setTotalPages(Math.ceil(data.count / PAGE_SIZE));
        } catch (error) {
          addNotification("error", "Error cargando ventas.");
          console.error(error);
        }
        setLoading(false);
      };
  
      if (user?.token) fetchData();
    }, [currentPage, isSearching, user]);*/
  
    /* =======================
       SEARCH
       ======================= */
    
    /*const handleSearchSubmit = async (query) => {
      if (query.length < 2) return;
  
      setIsSearching(true);
      setCurrentPage(1);
      setLoading(true);
  
      try {
        const data = await fetchSearchSales(query, setLoading, user.token);
        const formatted = formatSalesData(data);
  
        setAllSearchResults(formatted);
        setItems(formatted.slice(0, PAGE_SIZE));
        setTotalPages(Math.ceil(formatted.length / PAGE_SIZE));
      } catch (error) {
        addNotification("error", "Error buscando ventas.");
        setAllSearchResults([]);
        setItems([]);
        setTotalPages(1);
      }
  
      setLoading(false);
    };
  
    const clearSearch = () => {
      setIsSearching(false);
      setSearchInput("");
      setCurrentPage(1);
    };
  
  
    useEffect(() => {
      if (!isSearching) return;
  
      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      setItems(allSearchResults.slice(start, end));
    }, [currentPage, isSearching, allSearchResults]);
  
    useEffect(() => {
      setIsSomethingSelected(selectedItems.size > 0);
    }, [selectedItems]);*/
  
    const handlePageChange = (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };
  
    const reloadPageOne = () => {
      if (currentPage === 1) {
        setCurrentPage(2);
        setTimeout(() => setCurrentPage(1), 50);
      } else {
        setCurrentPage(1);
      }
    };

    return (
        <RequirePermission permission="access_inventory">
            <div className="d-flex justify-content-center mt-5">
                <div className="container container-modified">
                    <Header
                        notModifyItem={true}
                        title={"INGRESOS"}
                        isSomethingSelected={isSomethingSelected}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                        user={user}
                        items={items}
                        deleteItem={''}
                        isSale={true}
                        reloadPageOne={reloadPageOne}
                        titleAddItem={"Añadir nuevo ingreso"}
                        AddItemcontent={''}
                        onSubmitAddItem={''}
                        titleInfoForm={"Informacion del ingreso"}
                        onSubmitEditItem={() => { }}
                        InfoFormContent={''}
                    />

                    <div className="table-container">
                        <div className="d-flex justify-content-center align-items-center mb-3 flex-wrap">
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
                            setIsSomethingSelected={setIsSomethingSelected}
                            pkName={"id"}
                        />

                        <button
                            className="btn btn-outline-secondary clear-search-results-button"
                            onClick={''}
                        >
                            Limpiar resultados de búsqueda
                        </button>
                    </div>
                </div>
            </div>
        </RequirePermission>
    );
}