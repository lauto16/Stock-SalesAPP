import { Row, Col } from "react-bootstrap"
import CustomInput from "../../crud/CustomInput"
export default function AddItemContent({ register, errors }) {
    //infoForm content deberia respetar la signatura de register y selectedItem
    return (
        <Row className="g-3">
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Nombre'
                    icon='bi-person'
                    type='text'
                    register={register('name', {
                        required: "El nombre del proveedor es obligatorio",
                        minLength: {
                            value: 3,
                            message: "El nombre debe tener al menos 3 caracteres"
                        }
                    })}
                />
                {errors.name?.message && <div className="invalid-feedback d-block">{errors.name?.message}</div>}
            </Col>
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Teléfono'
                    icon='bi-telephone'
                    type='text'
                    register={register('phone', {
                        pattern: {
                            value: /^[0-9+\s-]{7,15}$/,
                            message: "Ingrese un teléfono válido (solo números, + o -)"
                        }
                    })}
                />
                {errors.phone?.message && <div className="invalid-feedback d-block">{errors.phone?.message}</div>}
            </Col>
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Dirección'
                    icon='bi-geo-alt'
                    type='text'
                    register={register('address', {
                        minLength: {
                            value: 5,
                            message: "La dirección debe tener al menos 5 caracteres"
                        }
                    })}
                />
                {errors.address?.message && <div className="invalid-feedback d-block">{errors.address?.message}</div>}
            </Col>
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Correo'
                    type='text'
                    icon='bi-envelope'
                    register={register('email', {
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Ingrese un email válido"
                        }
                    })}
                />
                {errors.email?.message && <div className="invalid-feedback d-block">{errors.email?.message}</div>}
            </Col>
        </Row>

    )
}
