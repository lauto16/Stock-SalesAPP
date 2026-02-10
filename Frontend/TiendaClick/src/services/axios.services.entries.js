import axios from 'axios';
import { apiUrl, authHeader } from './consts';


export async function addEntry(formData, token) {
    // Calculate discount and final price
    console.log("formData", formData);
    const applied_charge = parseFloat(formData.applied_charge);

    // Build items array with product_id and quantity
    const items = formData.selectedProducts.map((product) => ({
        product: product.code,
        quantity: parseFloat(formData[`quantity_${product.code}`]),
        unit_price: parseFloat(formData[`unit_price_${product.code}`])
    }));

    // Prepare the payload for backend
    const entryData = {
        applied_charge: applied_charge,
        rute_number: formData.rute_number,
        total_price: parseFloat(formData.total_price),
        details: items
    };
    console.log("entryData", entryData);

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

export async function deleteEntryById(id, token) {
    try {
        const response = await axios.delete(
            `${apiUrl}entries/delete-by-id/${id}/`,
            authHeader(token)
        );
        console.log(response);
        return response.data;
    } catch (error) {
        const backendError = error.response?.data?.error || "Error al eliminar la entrada.";
        return { success: false, error: backendError };
    }
}

export async function fetchEntries({ page = 1, setLoading, token }) {
    try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}entries/?page=${page}`, authHeader(token));
        return response.data;
    } catch (error) {
        console.error("Error al obtener las entradas:", error);
        return { results: [], count: 0 };
    } finally {
        setLoading(false);
    }
}

