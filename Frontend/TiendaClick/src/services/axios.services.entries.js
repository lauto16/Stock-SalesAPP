import axios from 'axios';
import { apiUrl, authHeader } from './consts';


export default async function addEntry(formData, token) {
    // Calculate discount and final price
    console.log(formData);
    const applied_charge = parseFloat(formData.applied_charge);

    // Build items array with product_id and quantity
    const items = formData.selectedProducts.map((product) => ({
        product_id: product.code,
        quantity: parseFloat(formData[`quantity_${product.code}`]),
        buy_price: parseFloat(formData[`buy_price_${product.code}`])
    }));

    // Prepare the payload for backend
    const entryData = {
        applied_charge: applied_charge,
        rute_number: formData.rute_number,
        total_price: parseFloat(formData.total_price),
        items: items
    };

    try {
        await axios.post(`${apiUrl}entries/`, entryData, authHeader(token))
        return {
            success: true,
            success_message: "Ingreso creado con éxito"
        }
    } catch (error) {
        if (error.response) {
            const data = error.response.data;

            let value = "Error desconocido";

            if (typeof data === "object") {
                const firstKey = Object.keys(data)[0];
                value = data[firstKey];

                console.log(error);

                return {
                    success: false,
                    status: error.response.status,
                    error: value,
                }
            }

            return {
                success: false,
                status: null,
                error: "Error de red o del cliente",
            }
        }
    }
}
