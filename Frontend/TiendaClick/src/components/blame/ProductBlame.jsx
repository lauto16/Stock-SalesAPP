import { useEffect, useState } from "react";
import Pagination from "../inventory/Pagination";
import Search from "../inventory/Search";
import Table from "../crud/Table";
import { fetchBlames, fetchSearchBlames } from '../../services/axios.services'
import { useUser } from "../../context/UserContext";
import SimpleHeader from "../inventory/SimpleHeader"
import '../../css/blame.css'
import RequirePermission from "../permissions_manager/PermissionVerifier.jsx";


const FIELD_TRANSLATIONS = {
  object_code: "Código del producto",
  object_name: "Nombre del producto",
  field_name: "Campo modificado",
  old_value: "Valor anterior",
  new_value: "Valor posterior",
  changed_by: "Realizado por",
  changed_at: "Fecha",
};

const keysToShow = [
  "object_code",
  "object_name",
  "field_name",
  "old_value",
  "new_value",
  "changed_by",
  "changed_at",
];

const columns = keysToShow.map(key => ({
  key,
  className: key,
  label: FIELD_TRANSLATIONS[key] || key,
}));

export default function ProductBlame({ productCode }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [allSearchResults, setAllSearchResults] = useState([]);
  const [searchTotalPages, setSearchTotalPages] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  const [selectedItems, setSelectedItems] = useState(new Map());
  const [isSomethingSelected, setIsSomethingSelected] = useState(false);

  const { user } = useUser();

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 10);
  };

  const FIELD_NAME_TRANSLATIONS = {
    "code": 'Código',
    "name": 'Nombre',
    "stock": 'Stock',
    "sell_price": 'Precio de venta',
    "buy_price": 'Precio de compra',
    "provider": 'Proveedor',
    "last_modification": 'Ultima Modificación'
  };

  useEffect(() => {
    fetchBlames(1, setLoading, user.token).then((data) => {
      const formatIfFloat = (value) => {
        const num = parseFloat(value);
        return !isNaN(num) ? num.toFixed(2) : value;
      };

      const formattedResults = data.results.map(item => ({
        ...item,
        changed_at: item.changed_at ? formatDate(item.changed_at) : "",
        object_code: item.object_data?.code || "",
        object_name: item.object_data?.name || "",
        field_name: FIELD_NAME_TRANSLATIONS[item.field_name] || item.field_name,
        old_value: formatIfFloat(item.old_value),
        new_value: formatIfFloat(item.new_value),
      }));

      setItems(formattedResults);
      setTotalPages(Math.ceil(data.count / 10));
      setCurrentPage(1);
    });
  }, [productCode, user, isSearching]);

  const handlePageChange = (newPage) => {
    fetchBlames(newPage, setLoading, user.token).then((data) => {
      const formatIfFloat = (value) => {
        const num = parseFloat(value);
        return !isNaN(num) ? num.toFixed(2) : value;
      };

      const formattedResults = data.results.map(item => ({
        ...item,
        changed_at: item.changed_at ? formatDate(item.changed_at) : "",
        object_code: item.object_data?.code || "",
        object_name: item.object_data?.name || "",
        field_name: FIELD_NAME_TRANSLATIONS[item.field_name] || item.field_name,
        old_value: formatIfFloat(item.old_value),
        new_value: formatIfFloat(item.new_value),
      }));

      setItems(formattedResults);
      setTotalPages(Math.ceil(data.count / 10));
      setCurrentPage(newPage);
    });
  };

  const handleSearchSubmit = async (query) => {
    if (query.length >= 2) {
      setIsSearching(true);
      setCurrentPage(1);
      setLoading(true);

      const data = await fetchSearchBlames(query, user.token);

      const formatIfFloat = (value) => {
        const num = parseFloat(value);
        return !isNaN(num) ? num.toFixed(2) : value;
      };

      if (data) {
        const formatted = data.results.map(item => ({
          ...item,
          changed_at: item.changed_at ? formatDate(item.changed_at) : "",
          object_code: item.object_data?.code || "",
          object_name: item.object_data?.name || "",
          field_name: FIELD_NAME_TRANSLATIONS[item.field_name] || item.field_name,
          old_value: formatIfFloat(item.old_value),
          new_value: formatIfFloat(item.new_value),
        }));
        setAllSearchResults(formatted);
        setSearchTotalPages(Math.ceil(data.count / 10));
      } else {
        setAllSearchResults([]);
        setSearchTotalPages(1);
      }

      setLoading(false);
    }
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchInput("");
    setCurrentPage(1);
    fetchBlames(1, setLoading, user.token).then((data) => {
      const formattedResults = data.results.map(item => ({
        ...item,
        changed_at: item.changed_at ? formatDate(item.changed_at) : "",
        object_code: item.object_data?.code || "",
        object_name: item.object_data?.name || "",
        field_name: FIELD_NAME_TRANSLATIONS[item.field_name] || item.field_name,
      }));

      setItems(formattedResults);
      setTotalPages(Math.ceil(data.count / 10));
    });
  };

  return (
    <RequirePermission permission="access_blame">
    <div className="d-flex justify-content-center mt-5">
      <div className="container container-modified">

        <SimpleHeader
          title={'CAMBIOS EN PRODUCTOS'}
          userRole={user.role}
        />

        <div className="table-container">
          <div className="d-flex justify-content-center align-items-center mb-3 flex-wrap">
            <Pagination
              currentPage={currentPage}
              totalPages={isSearching ? searchTotalPages : totalPages}
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
            items={isSearching ? allSearchResults : items}
            columns={columns}
            loading={loading}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            setIsSomethingSelected={setIsSomethingSelected}
            pkName="id"
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