import { Modal, Button, Form, Row } from "react-bootstrap";
import Input from "../crud/Input.jsx";
import { useAddItemForm } from "../crud/hooks/useAddItemForm.js";

export default function CreateSaleModal({ show, handleClose, productsList, onSaleCreated }) {
  const formConfig = () => {
    const FIELDS = [
      {
        name: "selectedProducts",
        label: "Productos (selecciona y define cantidad)",
        type: "multi-product-select",
        required: true,
        selectOptions: productsList,
      },
      {
        name: "applied_discount_percentage",
        label: "Descuento (%)",
        type: "number",
        step: 0.01,
        defaultValue: 0,
        required: false,
        placeholder: "0.00",
      },
    ];

    const onSubmitHandler = async (formData) => {
      if (!formData.selectedProducts || formData.selectedProducts.length === 0) {
        alert("Debe seleccionar al menos un producto con cantidad.");
        return;
      }

      const payload = {
        products: formData.selectedProducts.map((p) => ({
          product_code: p.code,
          quantity: p.quantity,
        })),
        applied_discount_percentage: parseFloat(formData.applied_discount_percentage) || 0,
      };

      await onSaleCreated(payload);
      handleClose();
    };

    const onUseEffect = () => {};

    const title = "Crear Nueva Venta";

    return { FIELDS, title, onSubmitHandler, onUseEffect };
  };

  const { onUseEffect, onSubmitHandler } = formConfig();
  const {
    register,
    handleSubmit,
    control,
    watch,
    errors,
    onSubmit,
    reset,
  } = useAddItemForm({ onSubmitHandler, handleClose, onUseEffect });

  const { FIELDS, title } = formConfig(watch);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      contentClassName="blurred-modal-content"
      backdropClassName="blurred-backdrop"
    >
      <Modal.Header style={{ backgroundColor: "#f5c193" }} closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: "#f0f0f0" }}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row className="g-3">
            {FIELDS.map((field, idx) => (
              <Input
                key={idx}
                field={field}
                register={register}
                control={control}
                errors={errors}
                reset={reset}
              />
            ))}
          </Row>

          <div className="d-flex justify-content-end">
            <Button variant="success" type="submit" className="mt-2 send-form-button">
              Crear Venta
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}