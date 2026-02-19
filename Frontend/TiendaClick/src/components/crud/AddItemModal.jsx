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
    reload,
    onItemCreated
}) {
    const {
        register,
        handleSubmit,
        watch,
        onSubmit,
        errors,
        reset,
        control,
        setValue
    } = useAddItemForm({ onSubmitHandler, handleClose, reload });

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
            const res = await onSubmit(data);
            if (onItemCreated && res.success) {
                console.log(data);
                onItemCreated(data);
            }
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
                <Form
                    onSubmit={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleSubmit(safeSubmit)(e);
                    }}
                >

                    <Content
                        register={register}
                        selectedItem={selectedItem}
                        watch={watch}
                        errors={errors}
                        control={control}
                        disabled={isSending}
                        setValue={setValue}
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