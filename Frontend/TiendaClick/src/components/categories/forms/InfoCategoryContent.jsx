import { Row, Col } from "react-bootstrap"
import CustomInput from "../../crud/CustomInput"

export default function InfoCategoryContent({ register, selectedItem, errors }) {
    register('old_name', { value: selectedItem.name })
    return (
        <Row className="g-3">
            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='Nombre de la categoria'
                    icon='bi-tag'
                    type='text'
                    defaultValue={selectedItem.name}
                    register={register('name', {
                        required: "El nombre de la categoria es obligatorio",
                        minLength: {
                            value: 3,
                            message: "El nombre debe tener al menos 3 caracteres"
                        }
                    })} />
                {errors.name?.message && <div className="invalid-feedback d-block">{errors.name?.message}</div>}
            </Col>

            <Col md={6} className="d-flex flex-column">
                <CustomInput
                    label='descripcion'
                    icon='bi-tag'
                    type='text'
                    defaultValue={selectedItem.description}
                    register={register('description')} />
                {errors.description?.message && <div className="invalid-feedback d-block">{errors.description?.message}</div>}
            </Col>


        </Row>
    )
}