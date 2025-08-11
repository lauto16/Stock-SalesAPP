import { addProduct } from "../../../services/axios.services.js";
import { useEffect, useState } from "react";
import { useProviders } from "../../providers/hooks/useProviders.js";
import { useUser } from "../../../context/UserContext.jsx";
const addItemConfig = (watch) => {
    const { user } = useUser();
    const token = user?.token;
    const { providers } = useProviders(token)

    const purchasePrice = watch?.("buy_price") || 0;
    const sellingPrice = watch?.("sell_price") || 0;
    const calculateProfitMargin = () => {
        if (Number(purchasePrice) === 0) return 0;
        return (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(2);
    };

    const TYPES = {
        INPUT: 'input',
        SELECT: 'select',
        INPUT_DISABLED: 'input_disabled',
        TEXT: 'text',
        NUMBER: 'number'
    }


    const title = 'Añadir nuevo Producto'
    const FIELDS = [
        {
            name: 'code',
            label: 'Código',
            icon: 'bi-upc',
            placeholder: 'Código',
            type: TYPES.TEXT,
            required: true,
            errorMsg: '',
        },
        {
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
            required: false,
            selectedOption: (value) => { providers.find(p => p.id === value) },
            selectOptions: providers,
            errorMsg: 'El proveedor es requerido',
        },
        {
            name: 'buy_price',
            label: 'Precio de compra',
            icon: 'bi-currency-dollar',
            placeholder: 'Precio de compra',
            type: TYPES.NUMBER,
            valueAsNumber: true,
            step: 'any',
        },
        {
            name: 'sell_price',
            label: 'Precio de venta',
            icon: 'bi-currency-dollar',
            placeholder: 'Precio de venta',
            type: TYPES.NUMBER,
            valueAsNumber: true,
            step: 'any',
        },
        {
            name: 'profitMargin',
            label: 'Porcentaje de ganancia',
            placeholder: 'Porcentaje de ganancia',
            type: TYPES.INPUT_DISABLED,
            defaultValue: `${calculateProfitMargin()} %`,
            style: { color: Number(calculateProfitMargin()) <= 0 ? "#dc3545" : "#28a792" },
        },
        {
            name: 'stock',
            label: 'Stock',
            icon: 'bi-box',
            placeholder: 'Stock',
            type: TYPES.NUMBER,
            valueAsNumber: true,
            step: 'any',
        },
    ];

    return {
        title,
        FIELDS,
        onSubmitHandler: addProduct,
    }
}
export default addItemConfig