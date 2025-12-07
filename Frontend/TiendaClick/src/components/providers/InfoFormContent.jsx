import { Row } from "react-bootstrap"
import CustomInput from "../crud/Input"
export default function InfoFormContent({ registrer }) {
  return (
    <Row>

      <Col md={6} className="d-flex flex-column">
        <CustomInput
          label
          icon
          type
          placeholder
          register
          step
          disabled
          value
          inputStyle />
      </Col>



    </Row>

  )
}