import { Row, Col, Form, Button } from "react-bootstrap";
import CustomInput from "../../crud/CustomInput";
import { Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { useUser } from "../../../context/UserContext.jsx";
import { fetchSearchProducts, addProduct } from "../../../services/axios.services.products.js";
import ContentAddProduct from "../../inventory/forms/ContentAddProduct.jsx";
import AddItemModal from "../../crud/AddItemModal.jsx";
import { useProviders } from "../../providers/hooks/useProviders.js";
import Select from "react-select";

export default function AddEntryContent({ register, control, errors, watch }) {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const { user } = useUser();
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
            const quantity = parseFloat(watchedQuantities[`quantity_${product.code}`]) || 0;
            return total + (product.buy_price * quantity);
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const charge = parseFloat(watch("applied_charge")) || 0;
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


                    {/* Rute number */}
                    <Col md={9}>
                        <CustomInput
                            label="N° de remito"
                            icon='bi-box-seam'
                            type='text'
                            register={register("ruteNumber", {})}
                        />
                        {errors.ruteNumber && (
                            <div className="invalid-feedback d-block">
                                {errors.ruteNumber.message}
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
                                        <th className="text-center">Proveedor</th>
                                        <th className="text-center">Cantidad</th>
                                        <th className="text-center">Precio Unit.</th>
                                        <th className="text-center">Precio Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProducts.map((product) => {
                                        const quantity = parseFloat(watchedQuantities[`quantity_${product.code}`]);
                                        const productSubtotal = product.buy_price * quantity || product.buy_price;
                                        return (
                                            <tr key={product.code}>
                                                <td>{product.name}</td>
                                                <td>{product.code}</td>
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

                                                {/* entry quantity */}
                                                <td className="text-center">
                                                    <CustomInput
                                                        type="text"
                                                        inputMode="decimal"
                                                        step="any"
                                                        defaultValue={1}
                                                        inputStyle={{ width: '70px', textAlign: 'center' }}
                                                        register={register(`quantity_${product.code}`, {
                                                            required: true,
                                                            setValueAs: (value) => {
                                                                if (!value) return 1;
                                                                return parseFloat(value.toString().replace(',', '.'));
                                                            },
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
                                                </td>
                                                {/* buy price */}
                                                <td className="text-center">
                                                    <CustomInput
                                                        type="text"
                                                        inputMode="decimal"
                                                        step="any"
                                                        defaultValue={product.buy_price}
                                                        inputStyle={{ width: '70px', textAlign: 'center' }}
                                                        register={register(`buy_price_${product.code}`, {
                                                            required: true,
                                                            setValueAs: (value) => {
                                                                if (!value) return 0;
                                                                return parseFloat(value.toString().replace(',', '.'));
                                                            },
                                                            min: {
                                                                value: 0,
                                                                message: "El precio debe ser mayor o igual a 0"
                                                            }
                                                        })}
                                                    />
                                                    {errors[`buy_price_${product.code}`] && (
                                                        <div className="invalid-feedback d-block">
                                                            {errors[`buy_price_${product.code}`].message}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-end">${productSubtotal.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="table-secondary">
                                    <tr>
                                        <td colSpan="5" className="text-end">
                                            <strong>Subtotal:</strong>
                                        </td>
                                        <td className="text-end">
                                            <strong>${calculateSubtotal().toFixed(2)}</strong>
                                        </td>
                                    </tr>

                                    {(() => {
                                        const charge = watch("applied_charge");
                                        const isPositive = charge > 0;
                                        return charge !== 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-end"><strong>Recargo / Descuento:</strong></td>
                                                {isPositive ? <td className="text-end text-danger"><strong>
                                                    +${Math.abs(charge)}
                                                </strong></td> : <td className="text-end text-success"><strong>
                                                    -${Math.abs(charge)}
                                                </strong></td>}
                                            </tr>
                                        );
                                    })()}
                                    <tr className="table-success">
                                        <td colSpan="5" className="text-end">
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