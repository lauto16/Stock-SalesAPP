import { Row, Col, Form } from "react-bootstrap"
import CustomInput from "../../crud/CustomInput"
import { useUser } from "../../../context/UserContext"
import { useController } from "react-hook-form"
import AsyncSelect from "react-select/async"
import { fetchSearchProducts } from "../../../services/axios.services"
import { useState, useEffect } from "react"

export default function InfoOfferContent({ register, selectedItem, errors, control }) {
    const { user } = useUser();
    const [selectedOptions, setSelectedOptions] = useState([]);

    const { field } = useController({
        name: 'products',
        control,
        defaultValue: selectedItem.products || []
    });

    useEffect(() => {
        // Initialize selectedOptions from the existing product codes
        // Since we don't have the names initially, we fallback to the code as label
        // Ideally, we would fetch the product details here
        const initialProducts = selectedItem.products || [];
        const initialOptions = initialProducts.map(code => ({
            value: code,
            label: `Código: ${code}` // Placeholder until we have a real name, or we could fetch it
        }));
        setSelectedOptions(initialOptions);
        // Ensure field value is synced (it should be via defaultValue, but good to be safe)
        // field.onChange(initialProducts); // Not purely necessary if defaultValue is correct
    }, [selectedItem]);

    const handleRemove = (e, productValue) => {
        e.preventDefault()
        const updatedOptions = selectedOptions.filter((item) => item.value !== productValue)
        setSelectedOptions(updatedOptions)

        // Update form state with just the codes
        const updatedCodes = updatedOptions.map(item => item.value)
        field.onChange(updatedCodes)
    }

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
                    label: `${p.name} (${p.code}) - $${p.sell_price.toFixed(2)}`
                }));
            }
            return [];
        } catch (error) {
            console.error("Error searching products:", error);
            return [];
        }
    };

    const handleSelectChange = (selected) => {
        const newSelected = selected || [];
        setSelectedOptions(newSelected);
        // Extract codes for the form
        field.onChange(newSelected.map(option => option.value));
    };

    return (
        <Row className="g-3">
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Nombre de la Oferta'
                    icon='bi-tag'
                    type='text'
                    defaultValue={selectedItem.name}
                    register={register('name', {
                        required: "El nombre de la oferta es obligatorio",
                        minLength: {
                            value: 3,
                            message: "El nombre debe tener al menos 3 caracteres"
                        }
                    })} />
                {errors.name?.message && <div className="invalid-feedback d-block">{errors.name?.message}</div>}
            </Col>

            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Porcentaje de Descuento'
                    icon='bi-percent'
                    type='number'
                    defaultValue={selectedItem.percentage}
                    step={'any'}
                    register={register('percentage', {
                        required: true,
                        min: {
                            value: 0,
                            message: "El porcentaje debe ser mayor o igual a 0"
                        }
                    })}
                />
                {errors.percentage?.message && <div className="invalid-feedback d-block">{errors.percentage?.message}</div>}
            </Col>

            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Fecha de Finalización'
                    icon='bi-calendar'
                    type='date'
                    defaultValue={selectedItem.end_date}
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

            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    defaultValue={selectedItem.name}
                    register={register('id', {})}
                    inputStyle={{ display: 'none' }}
                />
            </Col>

            {/*Search and add products section*/}
            <Col md={12} className="d-flex flex-column">
                <Form.Group className="mb-1">
                    <Form.Label>Productos ({selectedOptions.length})</Form.Label>
                    <AsyncSelect
                        isMulti
                        cacheOptions
                        defaultOptions
                        loadOptions={loadProductOptions}
                        placeholder="Buscar productos..."
                        value={selectedOptions}
                        onChange={handleSelectChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') e.preventDefault();
                        }}
                        noOptionsMessage={({ inputValue }) =>
                            inputValue.length < 2
                                ? "Escribe al menos 2 caracteres"
                                : "No se encontraron productos"
                        }
                    />

                    {errors.products && (
                        <small className="text-danger">{errors.products.message}</small>
                    )}
                </Form.Group>
            </Col>

            {/* Selected products section */}
            <Col md={12}>
                <div className="mt-3">
                    <h5 className="mb-3">
                        <i className="bi bi-box-seam me-2"></i>
                        Productos en esta Oferta
                    </h5>
                    {selectedOptions.length > 0 ? (
                        <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                            <Row className="g-2">
                                {selectedOptions.map((option, index) => (
                                    <Col key={index} md={6} lg={4}>
                                    <div className="p-2 bg-white rounded border d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-box text-primary me-2"></i>
                                            <small className="text-secondary" style={{ fontSize: '0.85rem' }}>
                                                {option.label}
                                            </small>
                                        </div>
                                
                                        <button
                                            className="btn btn-sm btn-danger ms-2"
                                            type="button"
                                            onClick={(e) => handleRemove(e, option.value)}
                                            title="Desvincular"
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </div>
                                </Col>
                                ))}
                            </Row>
                        </div>
                    ) : (
                        <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            No hay productos asociados a esta oferta
                        </div>
                    )}
                </div>
            </Col>
        </Row>
    )
}