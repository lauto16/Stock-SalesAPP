import { Modal, Button, Form } from "react-bootstrap";
import { useAddItemForm } from './hooks/useAddItemForm.js'
import { useEffect, useState } from "react";

export default function AddItemModal({ onSubmitHandler, show, handleClose, selectedItems, title, Content, reloadPageOne }) {
    const {
        register,
        handleSubmit,
        watch,
        onSubmit,
        errors,
        reset,
        control,
    } = useAddItemForm({ onSubmitHandler, handleClose, reloadPageOne });

    const [selectedItem, setSelectedItem] = useState({})

    useEffect(() => {
        if (selectedItems?.size) {
            //get the only selected item, making the transalation from map to array
            const item = Array.from(selectedItems)[0][1];
            setSelectedItem(item);
            reset(item)
        }
    }, [selectedItems])

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="lg"
            contentClassName="blurred-modal-content"
            backdropClassName="blurred-backdrop">

            <Modal.Header style={{ backgroundColor: "#f5c193" }} closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: "#f0f0f0" }}>
                <Form onSubmit={handleSubmit(onSubmit)}>

                    <Content register={register} selectedItem={selectedItem} watch={watch} errors={errors} />

                    <div className="d-flex justify-content-end">
                        <Button variant="success" type="submit" className="mt-2 send-form-button">
                            Agregar
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}