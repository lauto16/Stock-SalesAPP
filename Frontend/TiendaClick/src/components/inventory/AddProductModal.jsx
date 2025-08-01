import { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { fetchProviders, addProduct } from "../../services/axios.services";
import { useNotifications } from '../../context/NotificationSystem';
import Input from '../crud/Input.jsx'
import { useUser } from "../../context/UserContext";


export default function AddProductModal({ show, handleClose, title, callbacksUseEfect, pk = 'id' }) {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        control,
        formState: { errors },
    } = useForm({
        defaultValues: {
            provider: null,
        },
    }
    );

    const { user } = useUser();
    const { addNotification } = useNotifications();
    const [providers, setProviders] = useState([])
    const codeInputRef = useRef(null);


    useEffect(() => {
        if (show) {
            fetchProviders(user.token)
                .then((res) => setProviders(res.data))
                .catch(() => handleBeforeClose('error', 'No se pudieron cargar los proveedores'));
        }
    }, [show, user.token]);

    const purchasePrice = watch("purchasePrice") || 0;
    const sellingPrice = watch("sellingPrice") || 0;

    const calculateProfitMargin = () => {
        if (Number(purchasePrice) === 0) return 0;
        return (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(2);
    };

    const handleBeforeClose = (type, message) => {
        handleClose()
        if (type === 'success') {
            reset()
        }
        addNotification(type, message);
    }

    const onSubmit = (data) => {
        if (!data.code || !data.name) {
            return;
        }

        addProduct(
            data.code,
            data.name,
            data.stock,
            data.sellingPrice,
            data.purchasePrice,
            data.provider,
            user.token
        )
            .then(() => handleBeforeClose('success', 'Producto agregado con éxito'))
            .catch(() => handleBeforeClose('error', 'Error al cargar el producto'));
    };

    title = 'Añadir nuevo Producto'
    const TYPES = {
        INPUT: 'input',
        SELECT: 'select',
        INPUT_DISABLED: 'input_disabled',
        TEXT: 'text',
        NUMBER: 'number'

    }

    const FIELDS = [
        {
            name: 'code',
            label: 'Código',
            icon: 'bi-upc',
            placeholder: 'Código',
            type: TYPES.TEXT,
            required: true,
            errorMsg: '',
            step: '0.01',
            valueAsNumber: true,
            defaultValue: null,


        }, {
            name: 'name',
            label: 'Nombre',
            icon: 'bi-tag',
            placeholder: 'Nombre',
            type: TYPES.TEXT,
            required: true,
        },
        {
            name: 'provider',
            label: 'Proveedor',
            placeholder: 'Seleccionar proveedor...',
            type: TYPES.SELECT,
            required: true,
            selectedOption: (value) => { providers.find(p => p.id === value) },
            selectOptions: providers,
            errorMsg: 'El proveedor es requerido',
        },
        {
            name: 'purchasePrice',
            label: 'Precio de compra',
            icon: 'bi-currency-dollar',
            type: TYPES.NUMBER,

            valueAsNumber: true
        },
        {
            name: 'sellingPrice',
            label: 'Precio de venta',
            icon: 'bi-currency-dollar',
            type: TYPES.NUMBER,

            valueAsNumber: true
        },
        {
            name: 'profitMargin',
            label: 'Porcentaje de ganancia',
            type: TYPES.INPUT_DISABLED,
            defaultValue: `${calculateProfitMargin()} %`,
            style: { color: Number(calculateProfitMargin()) <= 0 ? "#dc3545" : "#28a792" }
        },
        {
            name: 'stock',
            label: 'Stock',
            icon: 'bi-box',
            type: TYPES.NUMBER,
            valueAsNumber: true
        }

    ]

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
                        {FIELDS.map((field, index) => (
                            <Input field={field}
                                register={register}
                                control={control}
                                errors={errors}
                                index={index}
                                TYPES={TYPES}
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