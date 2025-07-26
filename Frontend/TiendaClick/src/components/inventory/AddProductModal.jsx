import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import CustomInput from "./CustomInput";
import { getProviders, addProduct } from "../../services/axios.services";

export default function AddProductModal({ show, handleClose }) {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm();

    const [providers, setProviders] = useState([])

    const codeInputRef = useRef(null);

    useEffect(() => {
        if (show && codeInputRef.current) {
            setTimeout(() => {
                codeInputRef.current.focus();
            }, 100);
        }

        if (show) {
            getProviders()
                .then((res) => setProviders(res.data.results))
                .catch((err) => console.error("Error al obtener proveedores:", err));
        }
    }, [show]);

    const purchasePrice = watch("purchasePrice") || 0;
    const sellingPrice = watch("sellingPrice") || 0;

    const calculateProfitMargin = () => {
        if (Number(purchasePrice) === 0) return 0;
        return (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(2);
    };

    const handleBeforeClose = () => {
        handleClose()
        reset()
    }

    const onSubmit = (data) => {
        if (!data.code || !data.name) {
            return;
        }

        addProduct(data.code, data.name, data.stock, data.sellingPrice, data.purchasePrice)
        .then(data => handleBeforeClose())
        .catch(err => console.error(err));

    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="lg"
            contentClassName="blurred-modal-content"
            backdropClassName="blurred-backdrop"
        >
            <Modal.Header style={{ backgroundColor: "#f5c193" }} closeButton>
                <Modal.Title>Agregar Producto</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: "#f0f0f0" }}>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row className="g-3">
                        <Col md={6} className="d-flex flex-column">
                            <CustomInput
                                label="Codigo"
                                icon="bi-upc"
                                type="text"
                                placeholder="Codigo"
                                register={{
                                    ...register("code", { required: true }),
                                    ref: (e) => {
                                        register("code", { required: true }).ref(e);
                                        codeInputRef.current = e;
                                    },
                                }}
                            />
                        </Col>
                        <Col md={6} className="d-flex flex-column">
                            <CustomInput
                                label="Nombre"
                                icon="bi-tag"
                                type="text"
                                placeholder="Nombre"
                                register={register("name", { required: true })}
                            />
                        </Col>
                        <Col md={6} className="d-flex flex-column">
                            <Form.Group className="mb-3">
                                <Form.Label>Proveedor</Form.Label>
                                <Form.Select {...register("provider", { required: true })}>
                                    <option value="">Seleccionar proveedor</option>
                                    {providers.map((provider, index) => (
                                        <option key={index}>
                                            {provider.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                {errors.provider && (
                                    <small className="text-danger">El proveedor es requerido</small>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={6} className="d-flex flex-column">
                            <CustomInput
                                label="Precio de compra"
                                icon="bi-currency-dollar"
                                type="number"
                                step="0.01"
                                placeholder="Precio de compra"
                                register={register("purchasePrice", { valueAsNumber: true })}
                            />
                        </Col>
                        <Col md={6} className="d-flex flex-column">
                            <CustomInput
                                label="Precio de venta"
                                icon="bi-currency-dollar"
                                type="number"
                                step="0.01"
                                placeholder="Precio de venta"
                                register={register("sellingPrice", { valueAsNumber: true })}
                            />
                        </Col>
                        <Col md={6} className="d-flex flex-column">
                            <Form.Group className="mb-3 w-100">
                                <Form.Label>Porcentaje de ganancia</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white">%</span>
                                    <Form.Control
                                        type="text"
                                        placeholder="Porcentaje de ganancia %"
                                        value={`${calculateProfitMargin()} %`}
                                        disabled
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={6} className="d-flex flex-column">
                            <CustomInput
                                label="Stock"
                                icon="bi-box"
                                type="number"
                                placeholder="Stock"
                                register={register("stock", { valueAsNumber: true })}
                            />
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-end">
                        <Button
                            variant="success"
                            type="submit"
                            className="mt-2 add-product-send-button"
                        >
                            Agregar
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}