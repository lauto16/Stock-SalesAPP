import { Modal, Button, Form, Row } from "react-bootstrap";
import Input from './Input.jsx'
import { useAddItemForm } from './hooks/useAddItemForm.js'


export default function AddItemModal({ show, handleClose, formConfig, selectedItems }) {
    if (!formConfig) return
    //when we need to execute a function inside useEffect, not implemented yet
    const { onUseEffect, onSubmitHandler } = formConfig();
    const {
        register,
        handleSubmit,
        control,
        watch,
        errors,
        onSubmit,
        reset
    } = useAddItemForm({ onSubmitHandler, handleClose, onUseEffect });
    const { FIELDS, title } = formConfig(watch, selectedItems ?? undefined);
    // reset(FIELDS.map((field) => { field.name })
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
                        {/*Pasar el field por prop como un componente */}
                        {FIELDS.map((field, index) => (
                            <Input field={field}
                                reset={reset}
                                register={register}
                                control={control}
                                errors={errors}
                                key={index}
                            />
                        )
                        )}

                    </Row>
                    <div className="d-flex justify-content-end">
                        <Button
                            variant="success"
                            type="submit"
                            className="mt-2 send-form-button"
                        >
                            Agregar
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
} { }