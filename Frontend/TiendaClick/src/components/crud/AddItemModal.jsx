import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAddItemForm } from './hooks/useAddItemForm.js';
import { useEffect, useState } from "react";

export default function AddItemModal({
    notModifyItem,
    onSubmitHandler,
    show,
    handleClose,
    selectedItems,
    title,
    Content,
    reloadPageOne
}) {
    const {
        register,
        handleSubmit,
        watch,
        onSubmit,
        errors,
        reset,
        control,
    } = useAddItemForm({ onSubmitHandler, handleClose, reloadPageOne });

    const [selectedItem, setSelectedItem] = useState({});
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (selectedItems?.size) {
            // get the only selected item, making the translation from map to array
            const item = Array.from(selectedItems)[0][1];
            setSelectedItem(item);
            reset(item);
        }
    }, [selectedItems, reset]);

    const safeSubmit = async (data) => {
        if (isSending) return;

        try {
            setIsSending(true);
            await onSubmit(data);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="lg"
            contentClassName="blurred-modal-content"
            backdropClassName="blurred-backdrop"
        >
            <Modal.Header style={{ backgroundColor: "#f5c193" }} closeButton={!isSending}>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ backgroundColor: "#f0f0f0" }}>
                <Form onSubmit={handleSubmit(safeSubmit)}>
                    <Content
                        register={register}
                        selectedItem={selectedItem}
                        watch={watch}
                        errors={errors}
                        control={control}
                        disabled={isSending}
                    />

                    <div className="d-flex justify-content-end">
                        {notModifyItem ? (
                            ""
                        ) : (
                            <Button
                                variant="success"
                                type="submit"
                                className="mt-2 send-form-button"
                                disabled={isSending}
                            >
                                {isSending ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            className="me-2"
                                        />
                                        Guardando...
                                    </>
                                ) : (
                                    "Agregar"
                                )}
                            </Button>
                        )}
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}