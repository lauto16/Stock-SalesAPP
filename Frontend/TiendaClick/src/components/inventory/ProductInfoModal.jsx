import { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import CustomInput from "./CustomInput";
import { getProviders, updateProduct } from "../../services/axios.services";
import { useNotifications } from "../../context/NotificationSystem";

export default function ProductInfoModal({ show, handleClose, product, unselectAll }) {
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
    const codeInputRef = useRef(null);

    useEffect(() => {
        if (show && product) {
            getProviders()
                .then((res) => {
                    setProviders(res.data.results);
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
    }, [show, product]);

    const purchasePrice = watch("purchasePrice") || 0;
    const sellingPrice = watch("sellingPrice") || 0;

    const calculateProfitMargin = () => {
        if (Number(purchasePrice) === 0) return 0;
        return (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(2);
    };

    const calculateIVA = (value) => (value * 1.21).toFixed(2);

    const onSubmit = async (data) => {
        try {
            const { success, error } = await updateProduct(product.code, {
                code: data.code,
                name: data.name,
                stock: data.stock,
                buy_price: data.purchasePrice,
                sell_price: data.sellingPrice,
                provider: data.provider,
            });

            if (success) {
                addNotification("success", "Producto actualizado con éxito");
                unselectAll();
                handleClose();

                // need to reload the page so the user can see the results of his transaction
                // maybe reload only the table component?
                setTimeout(() => {
                    window.location.reload();
                }, 200);

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
                                placeholder="Stock"
                                register={register("stock", { valueAsNumber: true })}
                            />
                        </Col>
                        <Col md={6}>
                            <CustomInput
                                label="Precio de compra"
                                icon="bi-currency-dollar"
                                type="number"
                                step="0.01"
                                placeholder="Precio de compra"
                                register={register("purchasePrice", { valueAsNumber: true })}
                            />
                        </Col>
                        <Col md={6}>
                            <CustomInput
                                label="Precio de venta"
                                icon="bi-currency-dollar"
                                type="number"
                                step="0.01"
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
                    <div className="d-flex justify-content-end mt-4">
                        <Button variante="success" className="mt-2 send-form-button" type="submit">
                            Guardar cambios
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}