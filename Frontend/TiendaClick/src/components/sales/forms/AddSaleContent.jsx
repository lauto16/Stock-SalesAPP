import { Row, Col, Form } from "react-bootstrap";
import CustomInput from "../../crud/CustomInput";
import { Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { useUser } from "../../../context/UserContext.jsx";
import { fetchSearchProducts } from "../../../services/axios.services.js";
/* 'applied_discount_percentage', 'discount_reason', 'initial_price', 'total_price',
    'tax_percentage', 'items'
*/
export default function AddSaleContent({ register, control, errors, watch }) {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const { user } = useUser();

    const discountPercentage = watch("applied_discount_percentage", 0);
    const watchedQuantities = watch();
    const watchedSelectedProducts = watch("selectedProducts");

    // Clear selected products when form is reset
    useEffect(() => {
        if (!watchedSelectedProducts) {
            setSelectedProducts([]);
        }
    }, [watchedSelectedProducts]);

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
    const calculateTotal = () => {
        return selectedProducts.reduce((total, product) => {
            const quantity = watchedQuantities[`quantity_${product.code}`] || 0;
            return total + (product.sell_price * quantity);
        }, 0);
    };

    const calculateFinalPrice = () => {
        const total = calculateTotal();
        const discount = (total * discountPercentage) / 100;
        return total - discount;
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


            {/* Summary */}
            {selectedProducts.length > 0 && (
                <Col md={12}>
                    <div className="alert alert-info mt-2">
                        <h6>Resumen de la venta:</h6>
                        <p className="mb-0">
                            <strong>Total final:</strong> ${calculateFinalPrice().toFixed(2)}
                        </p>
                    </div>
                </Col>
            )}
        </Row>
    );
}