import { useEffect, useState } from "react";
import { useProviders } from "../../providers/hooks/useProviders.js";
import { useUser } from "../../../context/UserContext.jsx";
import { addProvider } from "../../../services/axios.services.js";
const addItemConfig = (watch) => {

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
            icon: 'bi-person',
            placeholder: 'Nombre',
            type: TYPES.TEXT,
            required: true,
        },
        {
            name: 'phone',
            label: 'Teléfono',
            icon: 'bi-telephone',
            placeholder: 'Teléfono',
            type: TYPES.TEXT,
            errorMsg: '',
            required: true,

        },
        {
            name: 'email',
            label: 'Mail',
            icon: 'bi-envelope',
            placeholder: 'Ingrese Email...',
            type: TYPES.TEXT,
            required: false,
            errorMsg: '',
        },
        {
            name: 'address',
            label: 'Dirección',
            icon: 'bi-geo-alt',
            placeholder: 'Ingrese Dirección...',
            type: TYPES.TEXT,
            required: false,
            errorMsg: '',
        }
    ]

    return {
        title,
        FIELDS,
        onSubmitHandler: addProvider,
    }
}
export default addItemConfig