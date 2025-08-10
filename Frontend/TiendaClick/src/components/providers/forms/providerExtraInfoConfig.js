import { addProduct } from "../../../services/axios.services.js";
const itemInfo = (watch, providersSeleceted) => {

    const provider = providersSeleceted.entries().next().value?.[1]
    const TYPES = {
        INPUT: 'input',
        SELECT: 'select',
        INPUT_DISABLED: 'input_disabled',
        TEXT: 'text',
        NUMBER: 'number'
    }


    const title = 'Informacion del producto'
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
        }
    ]
    return {
        title,
        FIELDS,
        addItem: addProduct,
    }
}
export default itemInfo