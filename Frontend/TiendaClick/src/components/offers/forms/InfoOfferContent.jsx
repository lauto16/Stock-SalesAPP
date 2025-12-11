import { Row, Col } from "react-bootstrap"
import CustomInput from "../../crud/CustomInput"

export default function InfoOfferContent({ register, selectedItem, errors }) {
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
                    register={register('percentage', {
                        required: "El porcentaje de descuento es obligatorio",
                        min: {
                            value: 0,
                            message: "El porcentaje debe ser mayor o igual a 0"
                        },
                        max: {
                            value: 100,
                            message: "El porcentaje debe ser menor o igual a 100"
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

            {/* Products Section */}
            <Col md={12}>
                <div className="mt-3">
                    <h5 className="mb-3">
                        <i className="bi bi-box-seam me-2"></i>
                        Productos en esta Oferta
                    </h5>
                    {selectedItem.products && selectedItem.products.length > 0 ? (
                        <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                            <Row className="g-2">
                                {selectedItem.products.map((productId, index) => (
                                    <Col key={index} md={6} lg={4}>
                                        <div className="p-2 bg-white rounded border">
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-box text-primary me-2"></i>
                                                <small className="text-muted">Código: {productId}</small>
                                            </div>
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