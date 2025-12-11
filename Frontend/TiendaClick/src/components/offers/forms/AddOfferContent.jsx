import { Row, Col, Form } from "react-bootstrap"
import CustomInput from "../../crud/CustomInput"
import { Controller } from "react-hook-form"
import { useState, useEffect } from "react"
import AsyncSelect from "react-select/async"
import { useUser } from "../../../context/UserContext.jsx"
import { fetchSearchProducts } from "../../../services/axios.services.js"

export default function AddOfferContent({ register, control, errors, watch }) {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const { user } = useUser();

    const percentage = watch("percentage", 0);
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
                    label: `${p.name} (${p.code}) - $${p.sell_price.toFixed(2)}`,
                    ...p
                }));
            }
            return [];
        } catch (error) {
            console.error("Error searching products:", error);
            return [];
        }
    };

    const getPriceWithDiscount = (sell_price) => {
        return sell_price - (sell_price * percentage) / 100;
    };

    const getColorClass = () => {
        return percentage > 0 ? "text-success" : percentage < 0 ? "text-danger" : "text-dark";
    };

    return (
        <Row className="g-3">
            {/* Offer Name */}
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Nombre de la Oferta'
                    icon='bi-tag'
                    type='text'
                    register={register('name', {
                        required: "El nombre de la oferta es obligatorio",
                        minLength: {
                            value: 3,
                            message: "El nombre debe tener al menos 3 caracteres"
                        }
                    })} />
                {errors.name?.message && <div className="invalid-feedback d-block">{errors.name?.message}</div>}
            </Col>

            {/* Percentage */}
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Porcentaje de Descuento'
                    icon='bi-percent'
                    type='number'
                    step='0.01'
                    register={register('percentage', {
                        required: "El porcentaje de descuento es obligatorio",
                        validate: (value) => {
                            const num = parseFloat(value);
                            if (isNaN(num)) return "Debe ser un número válido";
                            return true;
                        }
                    })}
                />
                {errors.percentage?.message && <div className="invalid-feedback d-block">{errors.percentage?.message}</div>}

            </Col>

            {/* End Date */}
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Fecha de Finalización'
                    icon='bi-calendar'
                    type='date'
                    register={register('end_date', {
                        required: "La fecha de finalización es obligatoria",
                        validate: (value) => {
                            const selectedDate = new Date(value);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return selectedDate >= today || "La fecha debe ser hoy o posterior";
                        }
                    })}
                />
                {errors.end_date?.message && <div className="invalid-feedback d-block">{errors.end_date?.message}</div>}
            </Col>

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

            {/* Products Preview Table */}
            {selectedProducts.length > 0 && (
                <Col md={12}>
                    <h6 className="mb-3">Productos seleccionados:</h6>
                    <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>Stock</th>
                                    <th className="text-end">Precio Original</th>
                                    <th className={`text-end ${getColorClass()}`}>Precio con Oferta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedProducts.map((product) => (
                                    <tr key={product.code}>
                                        <td>{product.code}</td>
                                        <td>{product.name}</td>
                                        <td>{product.stock}</td>
                                        <td className="text-end">
                                            ${product.sell_price.toFixed(2)}
                                        </td>
                                        <td className={`text-end ${getColorClass()}`}>
                                            <strong>${getPriceWithDiscount(product.sell_price).toFixed(2)}</strong>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Col>
            )}
        </Row>
    )
}

