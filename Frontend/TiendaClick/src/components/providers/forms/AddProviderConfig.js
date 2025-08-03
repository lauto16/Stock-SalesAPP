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
        }
    ]

    return {
        title,
        FIELDS,
        addItem: addProvider,
    }
}
export default addItemConfig