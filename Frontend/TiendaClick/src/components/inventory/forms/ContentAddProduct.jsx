import { Row, Col, Form } from "react-bootstrap";
import CustomInput from "../../crud/CustomInput";
import Select from "react-select";
import { Controller } from "react-hook-form";
import { useProviders } from "../../providers/hooks/useProviders.js";
import { useUser } from "../../../context/UserContext.jsx";
import { useEffect, useState } from "react";
import { useCategories } from "../../Hooks/useCategories.js";

export default function ContentAddProduct({ register, watch, control, errors, selectedItem }) {

    // Token desde el contexto
    const { user } = useUser();
    const [profitMargin, setProfitMargin] = useState(0)
    // Lista de proveedores
    const { providers } = useProviders(user.token);
    const { categories } = useCategories(user.token);
    const [colorpm, setColorpm] = useState("#dc3545")
    const purchasePrice = watch("buy_price");
    const sellingPrice = watch("sell_price");

    const calculateProfitMargin = () => {
        if (Number(purchasePrice) <= 0) return 0;
        return (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(2);
    };
    useEffect(() => {
        setProfitMargin(calculateProfitMargin())
        setColorpm(Number(calculateProfitMargin()) <= 0 ? "#dc3545" : "#28a792")
    }, [purchasePrice, sellingPrice])

    return (
        <Row className="g-3">

            {/* Código */}
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Código'
                    icon='bi-upc'
                    type='text'
                    defaultValue={selectedItem?.code}
                    register={register('code', {
                        required: "El código es obligatorio"
                    })}
                />
                {errors.code && <div className="invalid-feedback d-block">{errors.code.message}</div>}
            </Col>

            {/* Nombre */}
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Nombre'
                    icon='bi-tag'
                    type='text'
                    defaultValue={selectedItem?.name}
                    register={register('name', {
                        required: "El nombre es obligatorio",
                        minLength: {
                            value: 3,
                            message: "El nombre debe tener al menos 3 caracteres"
                        }
                    })}
                />
                {errors.name && <div className="invalid-feedback d-block">{errors.name.message}</div>}
            </Col>

            {/* Proveedor */}
            <Col md={6} className="d-flex flex-column">
                <Form.Group className="mb-1">
                    <Form.Label>Proveedor</Form.Label>

                    <Controller
                        name="provider"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                value={providers.find(p => p.id === field.value) ? {
                                    label: providers.find(p => p.id === field.value).name,
                                    value: field.value
                                } : null}
                                onChange={(option) => field.onChange(option?.value)}
                                options={providers.map((p) => ({
                                    value: p.id,
                                    label: p.name
                                }))}
                                placeholder="Seleccionar proveedor..."
                                isSearchable
                            />
                        )}
                    />

                    {errors.provider && (
                        <small className="text-danger">{errors.provider.message}</small>
                    )}
                </Form.Group>
            </Col>

            

            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Precio de compra'
                    icon='bi-currency-dollar'
                    type='number'
                    defaultValue={0}
                    step='any'
                    register={register('buy_price', {
                        required: "El precio es obligatorio",
                    })}
                />
                {errors.buy_price && <div className="invalid-feedback d-block">{errors.buy_price.message}</div>}
            </Col>
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Precio de venta'
                    icon='bi-currency-dollar'
                    type='number'
                    defaultValue={0}
                    step='any'
                    register={register('sell_price', {
                        required: "El precio es obligatorio",
                    })}
                />
                {errors.sell_price && <div className="invalid-feedback d-block">{errors.sell_price.message}</div>}
            </Col>
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Porcentaje de ganancia'
                    icon='bi-currency-dollar'
                    type='text'
                    value={`${profitMargin}%`}
                    disabled={true}
                    inputStyle={{ color: colorpm }}
                    register={register('profitMargin')}
                />
            </Col>
            <Col md={12} className="d-flex flex-column">
                <Form.Group className="mb-1">
                    <Form.Label>Categoria</Form.Label>
                    <Controller
                        name="category"
                        control={control}
                        defaultValue={
                            categories?.find(
                                c => c.name.toLowerCase() === 'sin categoria'
                            )?.id ?? ""
                        }
                        render={({ field }) => (
                            <Form.Select
                                {...field}
                                className="form-select"
                                aria-label="Default select example"
                            >
                                <option value="">Seleccione una categoria</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </Form.Select>
                        )}
                    />
                </Form.Group>
            </Col>
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Stock'
                    icon='bi-box'
                    type='number'
                    step='0.01'
                    defaultValue={0}
                    register={register('stock', {
                        required: "El stock es obligatorio",
                    })}

                />
                {errors.stock && <div className="invalid-feedback d-block">{errors.stock.message}</div>}
            </Col>
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Fecha de vencimiento más próxima'
                    icon='bi-box'
                    type='date'
                    step=''
                    defaultValue={0}
                    register={register('expiration', {
                        required: false,
                    })}

                />
                {errors.stock && <div className="invalid-feedback d-block">{errors.stock.message}</div>}
            </Col>
        </Row>
    );
}



