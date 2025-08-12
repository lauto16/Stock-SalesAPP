import { updateProvider } from "../../../services/axios.services.js";
const itemInfo = (watch, providersSeleceted) => {
    //gets the 'provider selected' used to show the values(extra Info), 
    // getting the first value from the map of selected items, i.e: provider={name:name, phone:1234, ...}
    const provider = providersSeleceted?.entries().next().value?.[1]
    const TYPES = {
        INPUT: 'input',
        SELECT: 'select',
        INPUT_DISABLED: 'input_disabled',
        TEXT: 'text',
        NUMBER: 'number'
    }


    const title = 'Informacion del producto (editar)'
    const FIELDS = [
        {
            name: 'name',
            label: 'Nombre',
            icon: 'bi-person',
            type: TYPES.TEXT,
            defaultValue: provider?.name,
            required: true,
        },
        {
            name: 'phone',
            label: 'Teléfono',
            icon: 'bi-telephone',
            defaultValue: provider?.phone,
            type: TYPES.TEXT,
            errorMsg: '',
        },
        {
            name: 'email',
            label: 'Mail',
            icon: 'bi-envelope',
            defaultValue: provider?.email,

            type: TYPES.TEXT,
            required: false,
            errorMsg: '',
        },
        {
            name: 'address',
            label: 'Dirección',
            icon: 'bi-geo-alt',
            defaultValue: provider?.address,
            type: TYPES.TEXT,
            required: false,
            errorMsg: '',
        },
        {
            name: 'id',
            defaultValue: provider?.id,
            style: { display: "none" },
        }
    ]
    return {
        title,
        FIELDS,
        onSubmitHandler: updateProvider,
    }
}
export default itemInfo