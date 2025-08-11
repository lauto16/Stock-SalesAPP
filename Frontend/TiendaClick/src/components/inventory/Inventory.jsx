import { useEffect, useState } from "react";
import Header from "../crud/Header.jsx";
import Table from "../crud/Table.jsx";
import Pagination from "../inventory/Pagination.jsx";
import "../../css/inventory.css";
import Search from "./Search.jsx";
import { fetchSearchProducts, fetchProducts, addProduct, deleteProductByCode, fetchGetByCode, updateSelectedPrices, updateAllPrices } from "../../services/axios.services.js";
import ProductInfoModal from "./ProductInfoModal.jsx";
import PriceUpdateModal from "./PriceUpdateModal.jsx"
import ConfirmationModal from "../crud/ConfirmationModal.jsx"
import CreateOfferModal from "./CreateOfferModal.jsx";
import addItemConfig from "./forms/useAddItemsConfig.jsx";
import { useUser } from "../../context/UserContext.jsx";
import { useNotifications } from '../../context/NotificationSystem';

export default function InventoryPage() {

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [selectedItems, setSelectedItems] = useState(new Map());
    const [isSomethingSelected, setIsSomethingSelected] = useState(false)
    const [isSearching, setIsSearching] = useState(false);
    const [allSearchResults, setAllSearchResults] = useState([]);
    const [showProductInfo, setShowProductInfo] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showPriceUpdateModal, setShowPriceUpdateModal] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationText, setConfirmationText] = useState('')
    const [confirmationTitle, setConfirmationTitle] = useState('')
    const [showOfferModal, setShowOfferModal] = useState(false);
    const { addNotification } = useNotifications();

    const { user } = useUser();

    // States for update prices modal
    const [updatePricePercentage, setUpdatePricePercentage] = useState(0)
    const [includeDiscounted, setIncludeDiscounted] = useState(false);
    const [applyToAll, setApplyToAll] = useState(false);
    const [includeCombos, setIncludeCombos] = useState(false);

    const PAGE_SIZE = 10;
    //table columns
    const columns = [
        { className: "code", key: "code", label: 'Código' },
        { className: "name", key: "name", label: 'Nombre' },
        { className: "sell-price", key: "sell_price", label: 'Precio Venta' },
        { className: "buy-price", key: "buy_price", label: 'Precio Compra' },
        { className: "stock", key: "stock", label: 'Stock' },
        { className: "last-modification", key: "last_modification", label: 'Última Modificación' },
    ];

    //selectedItemsColums
    const importantColumns = [
        { className: "code", key: "code", label: 'Código' },
        { className: "name", key: "name", label: 'Nombre' },
        { className: "stock", key: "stock", label: 'Stock' },
    ];
    const handleShowConfirmation = () => setShowConfirmation(true);
    const handleHideConfirmation = () => setShowConfirmation(false);

    const clearSearch = () => {
        setIsSearching(false);
        setSearchInput("");
        setCurrentPage(1);
    };


    const handleSearchSubmit = async (query) => {
        if (query.length >= 2) {
            setIsSearching(true);
            setCurrentPage(1);
            setLoading(true);

            const results = await fetchSearchProducts(query, user.token);

            setAllSearchResults(results);
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const onExtraInfo = async () => {
        const firstSelected = Array.from(selectedItems.values())[0];

        if (selectedItems.size === 0) {
            addNotification("warning", "Selecciona un producto para ver su información.");
            return;
        }

        if (!firstSelected || !firstSelected.code) {
            addNotification("warning", "Selecciona un producto válido para ver su información.");
            return;
        }

        try {
            const data = await fetchGetByCode(firstSelected.code, user.token);  // <-- token aquí
            const buy_price_iva = data.buy_price * 1.21;
            const sell_price_iva = data.sell_price * 1.21;
            const margin_percent = data.buy_price > 0
                ? `${Math.round(((data.sell_price - data.buy_price) / data.buy_price) * 100)}%`
                : "0%";

            setSelectedProduct({
                ...data,
                buy_price_iva,
                sell_price_iva,
                margin_percent,
            });

            setShowProductInfo(true);
        } catch (error) {
            addNotification("error", "No se pudo obtener la información del producto.");
            console.error("Error al obtener producto:", error);
        }
    };

    const unselectAll = () => {
        if (isSomethingSelected) {
            setSelectedItems(new Map());
        }
    }

    const onPriceUpdate = () => {
        setShowPriceUpdateModal(true)
    }

    const applyPriceUpdate = (percentage, includeDiscounted, includeCombos, applyToAll) => {
        setUpdatePricePercentage(percentage);
        setIncludeDiscounted(includeDiscounted);
        setIncludeCombos(includeCombos);
        setApplyToAll(applyToAll);

        const isIncrease = percentage > 0;
        const isDecrease = percentage < 0;

        if (applyToAll) {
            if (isIncrease) {
                setConfirmationText("¿Estás seguro que deseas aumentar el precio de todos los productos?");
                setConfirmationTitle("Aumentar todos los productos");
            } else if (isDecrease) {
                setConfirmationText("¿Estás seguro que deseas disminuir el precio de todos los productos?");
                setConfirmationTitle("Abaratar todos los productos");
            }
        } else {
            if (isIncrease) {
                setConfirmationText("¿Estás seguro que deseas aumentar el precio de los productos seleccionados?");
                setConfirmationTitle("Aumentar productos seleccionados");
            } else if (isDecrease) {
                setConfirmationText("¿Estás seguro que deseas disminuir el precio de los productos seleccionados?");
                setConfirmationTitle("Abaratar productos seleccionados");
            }
        }

        handleShowConfirmation();
    };


    const handleUpdatePricesSendForm = async () => {
        const data = {
            percentage: updatePricePercentage,
            includeDiscounted,
            includeCombos,
        };

        let result;

        if (applyToAll) {
            result = await updateAllPrices(data, user.token);
        } else {
            result = await updateSelectedPrices(data, selectedItems, user.token);
        }

        if (result.success) {
            addNotification("success", "Precios actualizados correctamente");
            setShowConfirmation(false);
            reloadPageOne()
        } else {
            addNotification("error", result.error || "Hubo un error al actualizar los precios");
            setShowConfirmation(false);
        }
    }
    const reloadPageOne = () => {
        if (currentPage === 1) {
            setCurrentPage(2);
            setTimeout(() => setCurrentPage(1), 50);
        } else {
            setCurrentPage(1);
        }
        setLoading(true);
        setTimeout(() => setLoading(false), 0);
    }

    useEffect(() => {
        setIsSomethingSelected(selectedItems.size > 0);
    }, [selectedItems]);

    useEffect(() => {
        const fetchData = async () => {
            if (isSearching) return;
            console.log(user.token);

            if (!user?.token) return;

            setLoading(true);
            const data = await fetchProducts({
                page: currentPage,
                setLoading,
                token: user.token,
            });
            if (data.results === 404) {
                window.location.reload()
            }
            setItems(data.results);
            setTotalPages(Math.ceil(data.count / PAGE_SIZE));
            setLoading(false);
        };

        fetchData();
    }, [currentPage, isSearching, user]);

    useEffect(() => {
        if (!isSearching) return;

        const total = Math.ceil(allSearchResults.length / PAGE_SIZE);
        setTotalPages(total);

        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const pageItems = allSearchResults.slice(start, end);
        setItems(pageItems);
    }, [allSearchResults, currentPage, isSearching]);

    const EXTRABUTTONS = [{
        action: onPriceUpdate,
        title: 'Aumentar precios',
        icon: 'bi bi-graph-up-arrow me-2',
    },
    {
        action: setShowOfferModal,
        SomethingSelectedNeeded: true,
        icon: "bi bi-clock-history me-2",
        title: 'Oferta temporal'
    }
    ]

    return (
        <div className="d-flex justify-content-center mt-5">
            <CreateOfferModal
                show={showOfferModal}
                handleClose={() => setShowOfferModal(false)}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                setIsSomethingSelected={setIsSomethingSelected}
                fetchGetByCode={fetchGetByCode}
            />
            <ConfirmationModal
                show={showConfirmation}
                title={confirmationTitle}
                message={confirmationText}
                onSendForm={handleUpdatePricesSendForm}
                handleClose={handleHideConfirmation}
            />
            <PriceUpdateModal
                show={showPriceUpdateModal}
                handleClose={() => setShowPriceUpdateModal(false)}
                selectedItems={selectedItems}
                onApply={applyPriceUpdate}
                includeCombos={includeCombos}
                setIncludeCombos={setIncludeCombos}
                applyToAll={applyToAll}
                setApplyToAll={setApplyToAll}
                includeDiscounted={includeDiscounted}
                setIncludeDiscounted={setIncludeDiscounted}
            />
            <ProductInfoModal
                show={showProductInfo}
                handleClose={() => setShowProductInfo(false)}
                product={selectedProduct}
                unselectAll={unselectAll}
                reloadPageOne={reloadPageOne}
            />

            <div className="container container-modified">
                {/* Header component has 4 buttons, and extra can be added. For each button, an ItemConfig object must be 
                provided having two arguments: 1° the config dictionary containing constants, title and inputs; 
                2° the onSubmit function that runs when the form is submited   */}
                <Header
                    title={'INVENTARIO'}
                    isSomethingSelected={isSomethingSelected}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    items={items}
                    user={user}
                    onExtraInfo={onExtraInfo}
                    extraButtons={EXTRABUTTONS}
                    addFormConfig={addItemConfig}
                    deleteItem={deleteProductByCode}
                    selectedItemsColumns={importantColumns}
                />
                <div className="table-container">
                    <div className="d-flex justify-content-center align-items-center mb-3 flex-wrap ">

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

                    />
                    <button className="btn btn-outline-secondary clear-search-results-button" onClick={clearSearch}>
                        Limpiar resultados de busqueda
                    </button>

                </div>
            </div>
        </div>
    );
}
