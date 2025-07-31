import { useEffect, useState } from "react";
import Header from "./Header";
import Table from "./Table";
import Pagination from "./Pagination";
import "../../css/inventory.css";
import Search from "./Search";
import AddProductModal from "./AddProductModal";
import { fetchSearchProducts, fetchProducts, deleteProductByCode, fetchGetByCode, updateSelectedPrices, updateAllPrices } from "../../services/axios.services.js";
import { useNotifications } from '../../context/NotificationSystem';
import SelectedProductsModal from "./SelectedProductsModal";
import ProductInfoModal from "./ProductInfoModal";
import PriceUpdateModal from "./PriceUpdateModal"
import ConfirmationModal from "./ConfirmationModal"
import CreateOfferModal from "./CreateOfferModal";

export default function InventoryPage() {
    const userRole = "admin";
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Map());
    const [isSomethingSelected, setIsSomethingSelected] = useState(false)
    const [isSearching, setIsSearching] = useState(false);
    const [allSearchResults, setAllSearchResults] = useState([]);
    const { addNotification } = useNotifications();
    const [showProductInfo, setShowProductInfo] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showSelectedModal, setShowSelectedModal] = useState(false);
    const [showPriceUpdateModal, setShowPriceUpdateModal] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationText, setConfirmationText] = useState('')
    const [confirmationTitle, setConfirmationTitle] = useState('')
    const [showOfferModal, setShowOfferModal] = useState(false);

    // States for update prices modal
    const [updatePricePercentage, setUpdatePricePercentage] = useState(0)
    const [includeDiscounted, setIncludeDiscounted] = useState(false);
    const [applyToAll, setApplyToAll] = useState(false);
    const [includeCombos, setIncludeCombos] = useState(false);

    const PAGE_SIZE = 10;

    const columns = [
        { className: "code", key: "code", label: 'Código' },
        { className: "name", key: "name", label: 'Nombre' },
        { className: "sell-price", key: "sell_price", label: 'Precio Venta' },
        { className: "buy-price", key: "buy_price", label: 'Precio Compra' },
        { className: "stock", key: "stock", label: 'Stock' },
        { className: "last-modification", key: "last_modification", label: 'Última Modificación' },
    ];

    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false);
    const handleGoToSales = () => { };
    const handleShowConfirmation = () => setShowConfirmation(true);
    const handleHideConfirmation = () => setShowConfirmation(false);

    const clearSearch = () => {
        setIsSearching(false);
        setSearchInput("");
        setCurrentPage(1);
    };

    const toggleSelectAll = () => {
        if (isSomethingSelected) {
            setSelectedItems(new Map());
        } else {
            const newSelected = new Map();
            items.forEach(item => {
                newSelected.set(item.code, item);
            });
            setSelectedItems(newSelected);
        }
    };

    const handleDelete = async (codes) => {
        const newItems = [...items];

        for (const code of codes) {
            try {
                const result = await deleteProductByCode(code);
                if (result.success) {
                    addNotification('success', `Producto ${code} eliminado con éxito`);

                    const index = newItems.findIndex(item => item.code === code);
                    if (index !== -1) {
                        newItems.splice(index, 1);
                    }
                }
            } catch (error) {
                addNotification('error', `El producto ${code} no se pudo eliminar`);
            }

        }

        setItems(newItems);
        setSelectedItems(new Map());
    };

    const handleSearchSubmit = async (query) => {
        if (query.length >= 2) {
            setIsSearching(true);
            setCurrentPage(1);
            setLoading(true);
            const results = await fetchSearchProducts(query);
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
            const data = await fetchGetByCode(firstSelected.code);
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
            result = await updateAllPrices(data);
        } else {
            result = await updateSelectedPrices(data, selectedItems);
        }

        if (result.success) {
            addNotification("success", "Precios actualizados correctamente");
        } else {
            addNotification("error", result.error || "Hubo un error al actualizar los precios");
        }

        setShowConfirmation(false)
        // need to reload the page so the user can see the results of their transaction
        // maybe reload only the table component?
        setTimeout(() => {
            window.location.reload();
        }, 200);
    };

    useEffect(() => {
        setIsSomethingSelected(selectedItems.size > 0);
    }, [selectedItems]);

    useEffect(() => {
        const fetchData = async () => {
            if (isSearching) return;
            setLoading(true);
            const data = await fetchProducts({
                page: currentPage,
                setLoading,
            });
            setItems(data.results);
            setTotalPages(Math.ceil(data.count / PAGE_SIZE));
            setLoading(false);
        };

        fetchData();
    }, [currentPage, isSearching]);

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
                onHide={handleHideConfirmation}
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
            />
            {/* <AddProductModal show={showModal} handleClose={handleClose} /> */}
            <SelectedProductsModal
                show={showSelectedModal}
                handleClose={() => setShowSelectedModal(false)}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                isSomethingSelected={isSomethingSelected}
                setIsSomethingSelected={setIsSomethingSelected}
            />
            <div className="container container-modified">
                <Header
                    title={'INVENTARIO'}
                    isSomethingSelected={isSomethingSelected}
                    userRole={userRole}
                    onGoToSales={handleGoToSales}
                    onItem={handleOpen}
                    onDeleteSelected={() => handleDelete(Array.from(selectedItems.keys()))}
                    toggleSelectAll={toggleSelectAll}
                    onExtraInfo={onExtraInfo}
                    onViewSelected={() => setShowSelectedModal(true)}
                    selectedItems={selectedItems}
                    extraButtons={EXTRABUTTONS}
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
