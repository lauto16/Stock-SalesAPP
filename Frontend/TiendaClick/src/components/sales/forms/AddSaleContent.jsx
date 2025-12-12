import { Row, Col, Form } from "react-bootstrap";
import CustomInput from "../../crud/CustomInput";
import { Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { useUser } from "../../../context/UserContext.jsx";
import { fetchSearchProducts, fetchPaymentMethods } from "../../../services/axios.services.js";


export default function AddSaleContent({ register, control, errors, watch }) {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const { user } = useUser();
    const [paymentMethods, setPaymentMethods] = useState([]);
    const chargePercentage = watch("applied_charge_percentage", 0);
    const watchedQuantities = watch();
    const watchedSelectedProducts = watch("selectedProducts");

    // Clear selected products when form is reset
    useEffect(() => {
        if (!watchedSelectedProducts) {
            setSelectedProducts([]);
        }
    }, [watchedSelectedProducts]);

    //
    useEffect(() => {
        fetchPaymentMethods(user.token).then((data) => {
            setPaymentMethods(data);
            console.log(data);

        });
    }, []);

    // Load products dynamically based on search input
    const loadProductOptions = async (inputValue) => {
        if (!inputValue || inputValue.length < 2) {
            return [];
        }

        try {
            const data = await fetchSearchProducts(inputValue, user.token);
            if (data) {
                return data.map((p) => ({
                    value: p.code,
                    label: `${p.name} (${p.code}) - $${p.sell_price.toFixed(2)} - Stock: ${p.stock}`,
                    ...p
                }));
            }
            return [];
        } catch (error) {
            console.error("Error searching products:", error);
            return [];
        }
    };

    // Calculate total based on selected products and quantities
    const calculateSubtotal = () => {
        return selectedProducts.reduce((total, product) => {
            const quantity = parseFloat(watchedQuantities[`quantity_${product.code}`]) || 1;
            return total + (product.sell_price * quantity);
        }, 0);
    };

    const calculateCharge = () => {
        const subtotal = calculateSubtotal();
        return (subtotal * chargePercentage) / 100;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const charge = calculateCharge();
        return subtotal + charge;
    };


    return (
        <Row className="g-3">
            {/* Multi-Product Selector with Async Search */}
            <Col md={12} className="d-flex flex-column">
                <Form.Group className="mb-1">
                    <Form.Label>Productos</Form.Label>
                    <Controller
                        name="selectedProducts"
                        control={control}
                        rules={{ required: "Debe seleccionar al menos un producto" }}
                        render={({ field }) => (
                            <AsyncSelect
                                {...field}
                                value={selectedProducts}
                                isMulti
                                cacheOptions
                                defaultOptions={false}
                                loadOptions={loadProductOptions}
                                onChange={(selected) => {
                                    field.onChange(selected);
                                    setSelectedProducts(selected || []);
                                }}
                                onKeyDown={(e) => {
                                    // Prevent form submission when pressing Enter
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                    }
                                }}
                                placeholder="Buscar productos por nombre o código (mín. 2 caracteres)..."
                                noOptionsMessage={({ inputValue }) =>
                                    inputValue.length < 2
                                        ? "Escribe al menos 2 caracteres para buscar"
                                        : "No se encontraron productos"
                                }
                                loadingMessage={() => "Buscando productos..."}
                            />
                        )}
                    />
                    {errors.selectedProducts && (
                        <small className="text-danger">{errors.selectedProducts.message}</small>
                    )}
                </Form.Group>
            </Col>

            {/* Product Quantities */}
            {selectedProducts.length > 0 && (
                <Col md={12}>
                    <h6 className="mb-3">Cantidades por producto:</h6>
                    <Row className="g-3">
                        {selectedProducts.map((product) => {
                            // Responsive column sizing based on number of products
                            const colSize = selectedProducts.length === 1
                                ? 12
                                : selectedProducts.length === 2
                                    ? 6
                                    : 4;

                            return (
                                <Col md={colSize} key={product.code}>
                                    <CustomInput
                                        label={`${product.name} (${product.code})`}
                                        icon='bi-box'
                                        type='number'
                                        step='1'
                                        defaultValue={1}
                                        register={register(`quantity_${product.code}`, {
                                            required: "La cantidad es obligatoria",
                                            min: {
                                                value: 1,
                                                message: "La cantidad debe ser mayor a 0"
                                            },
                                            max: {
                                                value: product.stock,
                                                message: `La cantidad no puede ser mayor a ${product.stock}`
                                            }
                                        })}
                                    />
                                    {errors[`quantity_${product.code}`] && (
                                        <div className="invalid-feedback d-block">
                                            {errors[`quantity_${product.code}`].message}
                                        </div>
                                    )}
                                </Col>
                            );
                        })}
                    </Row>
                </Col>
            )}

            {/* Charge, Pay Method and Tax Fields */}
            {selectedProducts.length > 0 && (
                <>
                    <Col md={6}>
                        <CustomInput
                            label="Recargo (%)"
                            icon='bi-percent'
                            type='number'
                            step='0.01'
                            defaultValue={0}
                            register={register("applied_charge_percentage", {
                                min: {
                                    value: 0,
                                    message: "El recargo no puede ser negativo"
                                },
                                max: {
                                    value: 100,
                                    message: "El recargo no puede ser mayor a 100%"
                                }
                            })}
                        />
                        {errors.applied_charge_percentage && (
                            <div className="invalid-feedback d-block">
                                {errors.applied_charge_percentage.message}
                            </div>
                        )}
                    </Col>

                    <Col md={6}>
                        <CustomInput
                            label="Razón del aumento"
                            icon='bi-chat-left-text'
                            type='text'
                            placeholder="Ej: Recargo tarjeta credito"
                            register={register("charge_reason")}
                        />
                    </Col>
                </>
            )}

            {selectedProducts.length > 0 && <Col md={12} className="d-flex flex-column">
                <Form.Group className="mb-1">
                    <Form.Label>Medio de pago</Form.Label>
                    <Controller
                        name="payment_method"
                        control={control}
                        rules={{ required: "Debe seleccionar al menos un medio de pago" }}
                        render={({ field }) => (
                            <Form.Select
                                {...field}
                                className="form-select"
                                aria-label="Default select example"
                            >
                                <option value="">Seleccione un medio de pago</option>
                                {paymentMethods.map((method, index) => (
                                    <option key={index} value={method.name}>
                                        {method.name}
                                    </option>
                                ))}
                            </Form.Select>
                        )}
                    />
                    {errors.payment_method && (
                        <small className="text-danger">{errors.payment_method.message}</small>
                    )}
                </Form.Group>
            </Col>}

            {/* Summary Table */}
            {selectedProducts.length > 0 && (
                <Col md={12}>
                    <h6 className="mb-3">Resumen de la venta:</h6>
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Producto</th>
                                    <th>Código</th>
                                    <th className="text-center">Cantidad</th>
                                    <th className="text-end">Precio Unit.</th>
                                    <th className="text-end">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedProducts.map((product) => {
                                    const quantity = watchedQuantities[`quantity_${product.code}`] || 1;
                                    const subtotal = product.sell_price * quantity;

                                    return (
                                        <tr key={product.code}>
                                            <td>{product.name}</td>
                                            <td>{product.code}</td>
                                            <td className="text-center">{quantity}</td>
                                            <td className="text-end">${product.sell_price.toFixed(2)}</td>
                                            <td className="text-end">${subtotal.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="table-secondary">
                                <tr>
                                    <td colSpan="4" className="text-end"><strong>Subtotal:</strong></td>
                                    <td className="text-end"><strong>${calculateSubtotal().toFixed(2)}</strong></td>
                                </tr>
                                <tr>
                                    <td colSpan="4" className="text-end"><strong>IVA:</strong></td>
                                    <td className="text-end"><strong>21%</strong></td>
                                </tr>
                                {chargePercentage > 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-end">
                                            <strong>Recargo ({chargePercentage}%):</strong>
                                        </td>
                                        <td className="text-end text-danger">
                                            <strong>+${calculateCharge().toFixed(2)}</strong>
                                        </td>
                                    </tr>
                                )}
                                <tr className="table-success">
                                    <td colSpan="4" className="text-end"><strong>TOTAL:</strong></td>
                                    <td className="text-end"><strong>${calculateTotal().toFixed(2)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Col>
            )}
        </Row>
    );
}