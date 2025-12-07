import { Modal, Button, Form, Row } from "react-bootstrap";
import Input from './Input.jsx'
import { useAddItemForm } from './hooks/useAddItemForm.js'
import InfoFormContent from "../providers/InfoFormContent.jsx";
import { useEffect, useState } from "react";

export default function AddItemModal({ onSubmitHandler, show, handleClose, selectedItems, title, InfoForm }) {
    //when we need to execute a function inside useEffect, not implemented yet
    const {
        register,
        handleSubmit,
        control,
        watch,
        errors,
        onSubmit,
    } = useAddItemForm({ onSubmitHandler, handleClose });

    const [selectedItem, setSelectedItem] = useState({})
    useEffect(() => {
        if (selectedItems?.size) {
            //get the only selected item, making the transalation from map to array
            const first = Array.from(selectedItems)[0][1];
            setSelectedItem(first);
        }
    }, [show])
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

                    <InfoForm register={register} selectedItem={selectedItem} watch={watch} />

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