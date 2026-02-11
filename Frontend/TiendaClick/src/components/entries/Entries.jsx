import { useEffect, useState } from "react";
import Header from "../crud/Header.jsx";
import Table from "../crud/Table.jsx";
import Pagination from "../inventory/Pagination.jsx";
import "../../css/inventory.css";
import Search from "../inventory/Search.jsx";
import { addEntry, fetchEntries, deleteEntryById } from "../../services/axios.services.entries.js";
import { useUser } from "../../context/UserContext.jsx";
import { useNotifications } from "../../context/NotificationSystem";
import RequirePermission from "../permissions_manager/PermissionVerifier.jsx";
import AddEntryContent from "./forms/AddEntryContent.jsx";
import OnExtraInfoEntries from "./forms/OnExtraInfoEntries.jsx";
import { formatDate, formatHour } from "../../utils/formatDate.js";
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
    { className: "created_at", key: "full_date", label: "Fecha" },
    { className: "created_at", key: "hour", label: "Hora" },
  ];

  useEffect(() => {
    if (isSearching) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchEntries({ page: currentPage, setLoading: setLoading, token: user.token });
        if (!data.results) {
          return
        }
        console.log(data.results)
        const results = data?.results.map((entry) => {
          return {
            ...entry,
            full_date: entry.created_at ? formatDate(entry.created_at) : "",
            hour: entry.created_at ? formatHour(entry.created_at) : "",
          };
        });

        setItems(results);
        setTotalPages(Math.ceil(data.count / PAGE_SIZE));
      } catch (error) {
        addNotification("error", "Error cargando entradas.");
        console.error(error);
      }
      setLoading(false);
    };

    if (user?.token) fetchData();
    console.log(items)
  }, [currentPage, isSearching, user]);


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

  const reloadWithBounce = () => {
    const pageBeforeReload = currentPage;
    setLoading(true);
    setCurrentPage(1);
    setTimeout(() => {
      setCurrentPage(pageBeforeReload);
      setLoading(false);
    }, 100);
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
            deleteItem={deleteEntryById}
            isSale={true}
            reloadWithBounce={reloadWithBounce}
            titleAddItem={"Añadir nuevo ingreso"}
            AddItemcontent={AddEntryContent}
            onSubmitAddItem={addEntry}
            titleInfoForm={"Informacion del ingreso"}
            onSubmitEditItem={() => { }}
            InfoFormContent={OnExtraInfoEntries}
            selectedItemsColumns={columns}
            displayName={'Ingreso'}
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
              onClick={() => { }}
            >
              Limpiar resultados de búsqueda
            </button>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}