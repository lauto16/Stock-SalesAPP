import { addProduct } from "../../../services/axios.services.js";
import { useEffect, useState } from "react";
import { useProviders } from "../../providers/hooks/useProviders.js";

const addItemConfig = (watch) => {
    const { providers } = useProviders()

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
            placeholder: 'Codigo',
            type: TYPES.TEXT,
            required: true,
            errorMsg: '',

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
            name: 'buy_price',
            label: 'Precio de compra',
            icon: 'bi-currency-dollar',
            type: TYPES.NUMBER,

            valueAsNumber: true
        },
        {
            name: 'sell_price',
            label: 'Precio de venta',
            icon: 'bi-currency-dollar',
            type: TYPES.NUMBER,

            valueAsNumber: true
        },
        {
            name: 'profitMargin',
            label: 'Porcentaje de ganancia',
            type: TYPES.INPUT_DISABLED,
            defaultValue: `${calculateProfitMargin(watch)} %`,
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

    return {
        title,
        FIELDS,
        addItem: addProduct,
    }
}
export default addItemConfig