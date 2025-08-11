import { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import CustomInput from "../crud/CustomInput";
import { fetchProviders, updateProduct } from "../../services/axios.services";
import { useNotifications } from "../../context/NotificationSystem";
import { useUser } from "../../context/UserContext";

export default function ProductInfoModal({ show, handleClose, product, unselectAll, reloadPageOne }) {
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

    useEffect(() => {
        if (show && product) {
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
                    });
                })
                .catch(() => addNotification("error", "No se pudieron cargar los proveedores"));
        }
    }, [show, product, user.token]);

    const purchasePrice = watch("purchasePrice") || 0;
    const sellingPrice = watch("sellingPrice") || 0;

    const calculateProfitMargin = () => {
        if (Number(purchasePrice) === 0) return 0;
        return (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(2);
    };

    const calculateIVA = (value) => (value * 1.21).toFixed(2);

    const onSubmit = async (data) => {
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
                },
                user.token
            );

            if (success) {
                addNotification("success", "Producto actualizado con éxito");
                unselectAll();
                handleClose();
                reloadPageOne()
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

    return (
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
                                    rules={{ required: true }}
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
                                {errors.provider && (
                                    <small className="text-danger">El proveedor es requerido</small>
                                )}
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
                                <Form.Label>Precio compra + IVA</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={`$${calculateIVA(purchasePrice)}`}
                                    disabled
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Precio venta + IVA</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={`$${calculateIVA(sellingPrice)}`}
                                    disabled
                                />
                            </Form.Group>
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
                    </Row>

                    {/* NUEVA SECCIÓN DE OFERTA */}
                    {product?.offers_data && product.offers_data.length > 0 && (
                        <>
                            <hr />
                            <h5>Oferta(s) activa(s)</h5>
                            {product.offers_data.map((offer, idx) => {
                                const priceWithOffer = product.sell_price * (1 + offer.percentage / 100);
                                const priceWithOfferIVA = priceWithOffer * 1.21;
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
                                                    <Form.Label>Precio sin IVA</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={`$${priceWithOffer.toFixed(2)}`}
                                                        disabled
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={2}>
                                                <Form.Group>
                                                    <Form.Label>Precio con IVA</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={`$${priceWithOfferIVA.toFixed(2)}`}
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
                        <Button className="mt-2 send-form-button btn btn-success" type="submit">
                            Guardar cambios
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}