import { useEffect, useState } from "react";
import { useProviders } from "../../providers/hooks/useProviders.js";
import { useUser } from "../../../context/UserContext.jsx";
import { addProvider } from "../../../services/axios.services.js";
const addItemConfig = (watch) => {
    const { user } = useUser();
    const token = user?.token;
    const { providers } = useProviders(token)


    const TYPES = {
        INPUT: 'input',
        SELECT: 'select',
        INPUT_DISABLED: 'input_disabled',
        TEXT: 'text',
        NUMBER: 'number'
    }

    const title = 'Añadir Nuevo Proveedor'
    const FIELDS = [
        {
            name: 'name',
            label: 'Nombre',
            icon: 'bi-tag',
            placeholder: 'Nombre',
            type: TYPES.TEXT,
            required: true,
        },
        {
            name: 'phone',
            label: 'Teléfono',
            icon: 'bi-upc',
            placeholder: 'Télefono',
            type: TYPES.TEXT,
            errorMsg: '',

        },
        {
            name: 'email',
            label: 'Mail',
            placeholder: 'Ingrese Email...',
            type: TYPES.TEXT,
            required: false,
            errorMsg: '',
        },
        {
            name: 'Dirección',
            label: 'address',
            placeholder: 'Ingrese Dirección...',
            type: TYPES.TEXT,
            required: false,
            errorMsg: '',
        }
    ]

    return {
        title,
        FIELDS,
        addItem: addProvider,
    }
}
export default addItemConfig