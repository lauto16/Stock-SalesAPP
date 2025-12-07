import { Row, Col } from "react-bootstrap"
import CustomInput from "../crud/CustomInput"
export default function InfoFormContent({ register, selectedItem }) {
  //infoForm content deberia respetar la signatura de register y selectedItem
  return (
    <Row className="g-3">
      <Col md={6} className="d-flex flex-column">
        <CustomInput
          label='Nombre'
          icon='bi-person'
          type='text'
          placeholder={selectedItem.name}
          register={register('name', {
            required: true,
          })} />
      </Col>
      <Col md={6} className="d-flex flex-column">
        <CustomInput
          label='Teléfono'
          icon='bi-telephone'
          type='text'
          placeholder={selectedItem.phone}
          register={register('phone', {
            required: true
          })}
        />
      </Col>
      <Col md={6} className="d-flex flex-column">
        <CustomInput
          label='Dirección'
          icon='bi-geo-alt'
          type='text'
          placeholder={selectedItem.address}
          register={register('address', {
            required: true
          })}
        />
      </Col>
      <Col md={6} className="d-flex flex-column">
        <CustomInput
          placeholder={selectedItem.id}
          register={register('id', {
          })}
          inputStyle={{ display: 'none' }}
        />
      </Col>
    </Row>

  )
}
