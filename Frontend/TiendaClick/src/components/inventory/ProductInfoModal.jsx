import { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import CustomInput from "../crud/CustomInput";
import { updateProduct } from "../../services/axios.services.products.js";
import { fetchProviders } from "../../services/axios.services.providers.js"
import { useNotifications } from "../../context/NotificationSystem";
import { useUser } from "../../context/UserContext";
import { useCategories } from "../Hooks/useCategories.js";
import StockDecreaseConfirmationModal from "./StockDecreaseConfirmationModal.jsx"


export default function ProductInfoModal({ show, handleClose, product, unselectAll, reloadWithBounce }) {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        control,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            provider: null,
        },
    });

    const { addNotification } = useNotifications();
    const [providers, setProviders] = useState([]);
    const { user } = useUser();
    const [isSending, setIsSending] = useState(false)
    const { categories } = useCategories(user.token);

    const [showStockDecreaseConfModal, setShowStockDecreaseConfModal] = useState(true);
    const [showDecreaseConfirm, setShowDecreaseConfirm] = useState(false);
    const [pendingSubmitData, setPendingSubmitData] = useState(null);

    const executeUpdate = async (data) => {
        try {
            const { success, error } = await updateProduct(
                product.code,
                {
                    code: data.code,
                    name: data.name,
                    stock: data.stock,
                    buy_price: data.purchasePrice,
                    sell_price: data.sellingPrice,
                    provider: data.provider,
                    expiration: data.expiration,
                    category: data.category,
                },
                user.token
            );

            if (success) {
                addNotification("success", "Producto actualizado con éxito");
                unselectAll();
                handleClose();
                reloadWithBounce();
            } else {
                addNotification("error", error || "Error al actualizar el producto");
            }
        } catch (err) {
            addNotification(
                "error",
                err?.message || "Error inesperado al actualizar el producto"
            );
        }
    };

    useEffect(() => {
        console.log(categories);

    }, [categories]);

    useEffect(() => {

        if (show && product) {
            setIsSending(true)
            fetchProviders(user.token)
                .then((res) => {
                    setProviders(res.data);
                    reset({
                        code: product.code || "",
                        name: product.name || "",
                        stock: product.stock || 0,
                        purchasePrice: product.buy_price || 0,
                        sellingPrice: product.sell_price || 0,
                        provider: product.provider || null,
                        category: product.category || null,
                        expiration: product.expiration || null
                    });
                })
                .catch(() => addNotification("error", "No se pudieron cargar los proveedores"));
        }
        setIsSending(false)
    }, [show, product, user.token]);

    const purchasePrice = watch("purchasePrice") || 0;
    const sellingPrice = watch("sellingPrice") || 0;

    const calculateProfitMargin = () => {
        if (Number(purchasePrice) === 0) return 0;
        return (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(2);
    };

    const onSubmit = async (data) => {
        const previousStock = Number(product.stock || 0);
        const newStock = Number(data.stock || 0);

        const stockDecreased = newStock < previousStock;

        if (showStockDecreaseConfModal && stockDecreased) {
            setPendingSubmitData(data);
            setShowDecreaseConfirm(true);
            return;
        }

        await executeUpdate(data);
    };

    const confirmStockDecrease = async () => {
        setShowDecreaseConfirm(false);
        if (pendingSubmitData) {
            await executeUpdate(pendingSubmitData);
            setPendingSubmitData(null);
        }
    };

    const cancelStockDecrease = () => {
        setShowDecreaseConfirm(false);
        setPendingSubmitData(null);
    };

    return (
        <>
            <StockDecreaseConfirmationModal
                show={showDecreaseConfirm}
                handleClose={cancelStockDecrease}
                onConfirm={confirmStockDecrease}
                title="Disminución de stock detectada"
                message={
                    "El stock del producto fue reducido.\n" +
                    "Esta disminución será registrada como una pérdida económica.\n\n" +
                    "¿Deseas continuar?"
                }
                isSending={isSending}
            />

            <Modal show={show} onHide={handleClose} centered size="lg">
                <Modal.Header style={{ backgroundColor: "#f5c193" }} closeButton>
                    <Modal.Title>Modificar datos del producto</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: "#f0f0f0" }}>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row className="g-3">
                            <Col md={6}>
                                <CustomInput
                                    label="Código"
                                    icon="bi-upc"
                                    type="text"
                                    placeholder="Código"
                                    register={register("code", { required: true })}
                                    disabled={true}
                                />
                            </Col>
                            <Col md={6}>
                                <CustomInput
                                    label="Nombre"
                                    icon="bi-tag"
                                    type="text"
                                    placeholder="Nombre"
                                    register={register("name", { required: true })}
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Proveedor</Form.Label>
                                    <Controller
                                        name="provider"
                                        control={control}
                                        rules={{ required: false }}
                                        render={({ field }) => {
                                            const selectedOption = providers.find(p => p.id === field.value);

                                            return (
                                                <Select
                                                    {...field}
                                                    value={
                                                        selectedOption
                                                            ? { value: selectedOption.id, label: selectedOption.name }
                                                            : null
                                                    }
                                                    onChange={(option) => field.onChange(option ? option.value : null)}
                                                    options={providers.map(p => ({ value: p.id, label: p.name }))}
                                                    placeholder="Seleccionar proveedor..."
                                                    isSearchable
                                                />
                                            );
                                        }}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Categoria</Form.Label>
                                    <Controller
                                        name="category"
                                        control={control}
                                        rules={{ required: false }}
                                        render={({ field }) => {
                                            const selectedOption = categories.find(p => p.id === field.value);

                                            return (
                                                <Select
                                                    {...field}
                                                    value={
                                                        selectedOption
                                                            ? { value: selectedOption.id, label: selectedOption.name }
                                                            : null
                                                    }
                                                    onChange={(option) => field.onChange(option ? option.value : null)}
                                                    options={categories.map(p => ({ value: p.id, label: p.name }))}
                                                    placeholder="Seleccionar categoria..."
                                                    isSearchable
                                                />
                                            );
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <CustomInput
                                    label="Stock"
                                    icon="bi-box"
                                    type="number"
                                    step='any'
                                    placeholder="Stock"
                                    register={register("stock", { valueAsNumber: true })}
                                />
                                <div className="text-muted fst-italic mt-1 d-flex align-items-center gap-2 small">
                                    <i className="bi bi-info-circle-fill"></i>
                                    <span>
                                        Los cambios positivos de stock no se registrarán como ingresos, registra ingresos en <a style={{ textDecoration: 'none' }} href="/entries/">Ingresos</a>
                                    </span>
                                </div>
                            </Col>
                            <Col md={6}>
                                <CustomInput
                                    label="Precio de compra"
                                    icon="bi-currency-dollar"
                                    type="number"
                                    step="any"
                                    placeholder="Precio de compra"
                                    register={register("purchasePrice", { valueAsNumber: true })}
                                />
                            </Col>
                            <Col md={6}>
                                <CustomInput
                                    label="Precio de venta"
                                    icon="bi-currency-dollar"
                                    type="number"
                                    step="any"
                                    placeholder="Precio de venta"
                                    register={register("sellingPrice", { valueAsNumber: true })}
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>% Ganancia</Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white">%</span>
                                        <Form.Control
                                            type="text"
                                            value={calculateProfitMargin()}
                                            disabled
                                            style={{
                                                color:
                                                    Number(calculateProfitMargin()) <= 0
                                                        ? "#dc3545"
                                                        : "#28a745",
                                            }}
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Última modificación</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={product?.last_modification || ""}
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Fecha de vencimiento más próxima</Form.Label>
                                    <Form.Control
                                        type="date"
                                        {...register("expiration", {
                                            required: false,
                                            setValueAs: (value) => value === "" ? null : value
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {product?.offers_data && product.offers_data.length > 0 && (
                            <>
                                <hr />
                                <h5>Oferta(s) activa(s)</h5>
                                {product.offers_data.map((offer, idx) => {
                                    const priceWithOffer = product.sell_price * (1 + offer.percentage / 100);
                                    const isLast = idx === product.offers_data.length - 1;

                                    return (
                                        <div key={idx}>
                                            <Row className="g-3 mb-3">
                                                <Col md={3}>
                                                    <p className="fw-bold mb-1">{offer.name}</p>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Group>
                                                        <Form.Label>Porcentaje</Form.Label>
                                                        <Form.Control type="number" value={offer.percentage} disabled />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={3}>
                                                    <Form.Group>
                                                        <Form.Label>Fecha fin</Form.Label>
                                                        <Form.Control type="date" value={offer.end_date} disabled />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Group>
                                                        <Form.Label>Precio</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={`$${priceWithOffer.toFixed(2)}`}
                                                            disabled
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            {!isLast && <hr />}
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        <div className="d-flex justify-content-end mt-4">
                            <Button disabled={isSending} className="mt-2 send-form-button btn btn-success" type="submit">
                                Guardar cambios
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal
            >
        </>
    );
}