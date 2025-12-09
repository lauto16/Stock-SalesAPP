import { useEffect, useState } from "react";
import Header from "../crud/Header.jsx";
import Table from "../crud/Table.jsx";
import Pagination from "../inventory/Pagination.jsx";
import "../../css/inventory.css";
import Search from "../inventory/Search.jsx";
import SaleDetailModal from "./SaleDetailModal.jsx";
import { fetchSales, fetchSearchSales, deleteSaleById, addSale } from "../../services/axios.services.js";
import { useUser } from "../../context/UserContext.jsx";
import { useNotifications } from '../../context/NotificationSystem';
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
  const [showSaleDetailModal, setShowSaleDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const { user } = useUser();
  const { addNotification } = useNotifications();

  const PAGE_SIZE = 10;

  const columns = [
    { className: "initial", key: "initial_price", label: "Precio inicial" },
    { className: "total", key: "total_price", label: "Precio final" },
    { className: "discount_reason", key: "discount_reason", label: "Descuento / Aumento añadido" },
    { className: "product_count", key: "product_count", label: "Cantidad de productos" },
    { className: "date", key: "created_at", label: "Fecha" },
  ];

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 10);
  };

  const formatSalesData = (data) => {
    return data.map((sale) => {
      const percentage = sale.applied_discount_percentage ?? 0;
      const percentageElement = (
        <span style={{ color: percentage >= 0 ? "green" : "red" }}>
          {percentage}%
        </span>
      );

      return {
        ...sale,
        created_at: sale.created_at ? formatDate(sale.created_at) : "",
        total_price: sale.total_price?.toFixed(2) ?? "0.00",
        final_price: sale.final_price?.toFixed(2) ?? "0.00",
        discount_reason: (
          <>
            {sale.discount_reason} ({percentageElement})
          </>
        ),
        product_count: sale.items.length ?? 0,
      };
    });
  };

  useEffect(() => {
    if (isSearching) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchSales({ page: currentPage, setLoading: setLoading, token: user.token });
        setItems(formatSalesData(data.results));
        setTotalPages(Math.ceil(data.count / PAGE_SIZE));
      } catch (error) {
        addNotification("error", "Error cargando ventas.");
        console.error(error);
      }
      setLoading(false);
    };

    if (user?.token) fetchData();
  }, [currentPage, isSearching, user]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchSubmit = async (query) => {
    if (query.length >= 2) {
      setIsSearching(true);
      setCurrentPage(1);
      setLoading(true);

      try {
        const data = await fetchSearchSales(query, setLoading, user.token);
        setAllSearchResults(formatSalesData(data.results));
        setTotalPages(Math.ceil(data.count / PAGE_SIZE));
      } catch (error) {
        addNotification("error", "Error buscando ventas.");
        setAllSearchResults([]);
        setTotalPages(1);
      }
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchInput("");
    setCurrentPage(1);
  };

  const onShowSaleDetail = () => {
    if (selectedItems.size === 0) {
      addNotification("warning", "Selecciona una venta para ver detalles.");
      return;
    }
    if (selectedItems.size > 1) {
      addNotification("warning", "Selecciona solo una venta para ver detalles.");
      return;
    }
    const sale = Array.from(selectedItems.values())[0];
    setSelectedSale(sale);
    setShowSaleDetailModal(true);
  };

  useEffect(() => {
    setIsSomethingSelected(selectedItems.size > 0);
  }, [selectedItems]);

  useEffect(() => {
    if (!isSearching) return;
    const total = Math.ceil(allSearchResults.length / PAGE_SIZE);
    setTotalPages(total);

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setItems(allSearchResults.slice(start, end));
  }, [allSearchResults, currentPage, isSearching]);

  return (
    <RequirePermission permission="access_sales">
      <div className="d-flex justify-content-center mt-5">
        <div className="container container-modified">

          {showSaleDetailModal && selectedSale && (
            <SaleDetailModal
              show={showSaleDetailModal}
              handleClose={() => setShowSaleDetailModal(false)}
              sale={selectedSale}
            />
          )}

          <Header
            title={"VENTAS"}
            isSomethingSelected={isSomethingSelected}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            user={user}
            items={items}
            deleteItem={deleteSaleById}

            //implementar logica de paginado 
            reloadPageOne={() => { }}
            titleAddItem={'Añadir una nueva venta'}

            AddItemcontent={AddSaleContent}
            onSubmitAddItem={addSale}

            titleInfoForm={'Informacion de la venta (editar)'}

            onSubmitEditItem={() => { }}
            InfoFormContent={InfoFormContent}

            selectedItemsColumns={[
              { className: "id", key: "id", label: "ID" },
              { className: "created_at", key: "created_at", label: "Fecha" },
              { className: "total_price", key: "total_price", label: "Total" },
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
              pkName={'id'}
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