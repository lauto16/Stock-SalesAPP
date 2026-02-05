import { Row, Col, Form, Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import CustomInput from "../../crud/CustomInput";
import { Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { useUser } from "../../../context/UserContext.jsx";
import { fetchSearchProducts, fetchPaymentMethods, addProduct } from "../../../services/axios.services.js";
import ContentAddProduct from "../../inventory/forms/ContentAddProduct.jsx";
import AddItemModal from "../../crud/AddItemModal.jsx";
import { useProviders } from "../../providers/hooks/useProviders.js";
import Select from "react-select";

export default function AddEntry({ register, control, errors, watch }) {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const { user } = useUser();
    const chargePercentage = watch("applied_charge_percentage", 0);
    const watchedQuantities = watch();
    const watchedSelectedProducts = watch("selectedProducts");

    const { providers } = useProviders(user.token);
    const [showAddItem, setShowAddItem] = useState(false);

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
    const calculateSubtotal = () => {
        return selectedProducts.reduce((total, product) => {
            const quantity = parseFloat(watchedQuantities[`quantity_${product.code}`]) || 1;
            const offerPrice = product.sell_price * quantity * product.offers_data.percentage / 100;
            return total + (product.sell_price * quantity) - offerPrice;
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
                                autoFocus
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
                <Col md={12}>
                    <Button variant="success" className="mt-2 send-form-button" onClick={() => setShowAddItem(true)}>
                        <i className="bi bi-plus" style={{ fontSize: '18px' }}></i> Crear nuevo producto</Button>
                </Col>
            </Col>

            <AddItemModal show={showAddItem} handleClose={setShowAddItem} onSubmitHandler={addProduct}
                Content={ContentAddProduct} title={'Añadir nuevo producto'} />
            {/* charges */}
            {selectedProducts.length > 0 && (
                <>
                    <Col md={9}>
                        <CustomInput
                            label="Monto del recargo / descuento (si aplica)"
                            icon='bi-cash-stack text-danger'
                            type='number'
                            defaultValue={0}
                            register={register("applied_charge", {})}
                        />
                        {errors.applied_charge && (
                            <div className="invalid-feedback d-block">
                                {errors.applied_charge.message}
                            </div>
                        )}
                    </Col>
                </>
            )}
            {/* Summary Table */}
            <Col md={12}>
                {selectedProducts.length > 0 && (
                    <>
                        <h6 className="mb-3">Resumen del ingreso de productos:</h6>
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Producto</th>
                                        <th>Código</th>
                                        <th className="text-center">Cantidad</th>
                                        <th className="text-end">Precio Unit.</th>
                                        <th className="text-end">Precio Total</th>
                                        <th className="text-end">Proveedor</th>
                                        <th className="text-end">N° Remito</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProducts.map((product) => {
                                        const quantity = parseFloat(watchedQuantities[`quantity_${product.code}`]);
                                        const productSubtotal = product.buy_price * quantity;
                                        return (
                                            <tr key={product.code}>
                                                <td>{product.name}</td>
                                                <td>{product.code}</td>
                                                {/* entry quantity */}
                                                <td className="text-center">
                                                    <CustomInput
                                                        type="text"
                                                        inputMode="decimal"
                                                        step="any"
                                                        defaultValue={1}
                                                        inputStyle={{ width: '70px', textAlign: 'center' }}
                                                        register={register(`quantity_${product.code}`, {
                                                            required: "La cantidad es obligatoria",
                                                            setValueAs: (value) => {
                                                                if (!value) return value;
                                                                return parseFloat(value.toString().replace(',', '.'));
                                                            },
                                                            min: {
                                                                value: 0,
                                                                message: "La cantidad debe ser mayor o igual a 0"
                                                            }
                                                        })}
                                                    />

                                                    {errors[`quantity_${product.code}`] && (
                                                        <div className="invalid-feedback d-block">
                                                            {errors[`quantity_${product.code}`].message}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-end">${product.buy_price.toFixed(2)}</td>
                                                <td className="text-end">${productSubtotal.toFixed(2)}</td>
                                                {/* providers */}
                                                <td className="text-end">
                                                    <Controller
                                                        name={`provider_${product.code}`}
                                                        control={control}
                                                        defaultValue={product.provider}
                                                        render={({ field }) => (
                                                            <Select
                                                                {...field}
                                                                value={providers.find(p => p.id === field.value)
                                                                    ?
                                                                    {
                                                                        value: field.value,
                                                                        label: providers.find(p => p.id === field.value).name
                                                                    } : null
                                                                }
                                                                onChange={(option) => field.onChange(option?.value)}
                                                                options={providers.map(p => ({
                                                                    value: p.id,
                                                                    label: p.name
                                                                }))}
                                                                placeholder="Seleccionar proveedor..."
                                                                isSearchable
                                                                className="text-start"
                                                            />
                                                        )}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="table-secondary">
                                    <tr>
                                        <td colSpan="6" className="text-end">
                                            <strong>Subtotal:</strong>
                                        </td>
                                        <td className="text-end">
                                            <strong>${calculateSubtotal().toFixed(2)}</strong>
                                        </td>
                                    </tr>

                                    {(() => {
                                        const parsedCharge = Number(chargePercentage);
                                        const hasCharge =
                                            chargePercentage !== "" &&
                                            Number.isFinite(parsedCharge);

                                        return hasCharge && (
                                            <tr>
                                                <td colSpan="6" className="text-end">
                                                    <strong>Recargo / Descuento ({parsedCharge}%):</strong>
                                                </td>
                                                <td className="text-end text-danger">
                                                    <strong>
                                                        {parsedCharge >= 0 ? "+" : "-"}$
                                                        {Math.abs(calculateCharge()).toFixed(2)}
                                                    </strong>
                                                </td>
                                            </tr>
                                        );
                                    })()}

                                    <tr className="table-success">
                                        <td colSpan="6" className="text-end">
                                            <strong>TOTAL:</strong>
                                        </td>
                                        <td className="text-end">
                                            <strong>${calculateTotal().toFixed(2)}</strong>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </>
                )}
            </Col>
        </Row>
    );
}