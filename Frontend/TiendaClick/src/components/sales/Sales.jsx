import { useEffect, useState } from "react";
import Header from "../crud/Header.jsx";
import Table from "../crud/Table.jsx";
import Pagination from "../inventory/Pagination.jsx";
import "../../css/inventory.css";
import Search from "../inventory/Search.jsx";
import {
  fetchSales,
  fetchSearchSales,
  deleteSaleById,
  addSale,
} from "../../services/axios.services.js";
import { useUser } from "../../context/UserContext.jsx";
import { useNotifications } from "../../context/NotificationSystem";
import RequirePermission from "../permissions_manager/PermissionVerifier.jsx";
import AddSaleContent from "./forms/AddSaleContent.jsx";
import InfoFormContent from "./forms/InfoFormContent.jsx";

export default function Sales() {
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
    { className: "initial", key: "initial_price", label: "Precio inicial" },
    { className: "total", key: "total_price", label: "Precio final" },
    { className: "charge_reason", key: "charge_reason", label: "Descuento / Aumento añadido" },
    { className: "product_count", key: "product_count", label: "Cantidad de productos" },
    { className: "date", key: "full_date", label: "Fecha" },
    { className: "hour", key: "hour", label: "Hora" },
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

  const formatSalesData = (data = []) => {
    return data.map((sale) => {
      const percentage = sale.applied_charge_percentage ?? 0;

      return {
        ...sale,
        full_date: sale.created_at ? formatDate(sale.created_at) : "",
        total_price: sale.total_price?.toFixed(2) ?? "0.00",
        final_price: sale.final_price?.toFixed(2) ?? "0.00",
        charge_reason: (
          <>
            {sale.charge_reason} (
            <span style={{ color: percentage >= 0 ? "green" : "red" }}>
              {percentage}%
            </span>
            )
          </>
        ),
        product_count: sale.items?.length ?? 0,
      };
    });
  };

  /* =======================
     FETCH NORMAL
     ======================= */

  useEffect(() => {
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
  }, [currentPage, isSearching, user]);

  /* =======================
     SEARCH
     ======================= */

  const handleSearchSubmit = async (query) => {
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
  }, [selectedItems]);

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
    <RequirePermission permission="access_sales">
      <div className="d-flex justify-content-center mt-5">
        <div className="container container-modified">
          <Header
            title={"VENTAS"}
            isSomethingSelected={isSomethingSelected}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            user={user}
            items={items}
            deleteItem={deleteSaleById}
            isSale={true}
            reloadPageOne={reloadPageOne}
            titleAddItem={"Añadir una nueva venta"}
            AddItemcontent={AddSaleContent}
            onSubmitAddItem={addSale}
            titleInfoForm={"Informacion de la venta"}
            onSubmitEditItem={() => { }}
            InfoFormContent={InfoFormContent}
            selectedItemsColumns={[
              { className: "id", key: "id", label: "ID" },
              { className: "full_date", key: "full_date", label: "Fecha" },
              { className: "total_price", key: "total_price", label: "Total" },
              { className: "hour", key: "hour", label: "Hora" },
            ]}
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
              onClick={clearSearch}
            >
              Limpiar resultados de búsqueda
            </button>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}