import { Row, Col } from "react-bootstrap"
import CustomInput from "../crud/CustomInput"
export default function InfoFormContent({ register, selectedItem, errors }) {
  //infoForm content deberia respetar la signatura de register y selectedItem

  return (
    <Row className="g-3">
      <Col md={6} className="d-flex flex-column">
        <CustomInput
          label='Nombre'
          icon='bi-person'
          type='text'
          value={selectedItem.name}
          register={register('name', {
            required: "El nombre del proveedor es obligatorio",
            minLength: {
              value: 3,
              message: "El nombre debe tener al menos 3 caracteres"
            }
          })} />
        {errors.name?.message && <div className="invalid-feedback d-block">{errors.name?.message}</div>}

      </Col>
      <Col md={6} className="d-flex flex-column">
        <CustomInput
          label='Teléfono'
          icon='bi-telephone'
          type='text'
          value={selectedItem.phone}
          register={register('phone', {
            required: "El teléfono es obligatorio",
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
          value={selectedItem.address}
          register={register('address', {
            required: "La dirección es obligatoria",
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
            required: "El email es obligatorio",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Ingrese un email válido"
            }
          })}
        />
      </Col>
      {errors.email?.message && <div className="invalid-feedback d-block">{errors.email?.message}</div>}

      <Col md={6} className="d-flex flex-column">
        <CustomInput
          value={selectedItem.id}
          register={register('id', {
          })}
          inputStyle={{ display: 'none' }}
        />
      </Col>
    </Row>

  )
}
