import axios from 'axios';
import { apiUrl, authHeader } from './consts';

async function fetchOffers({ page = 1, setLoading, token }) {
    try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}offers/?page=${page}`, authHeader(token));
        return response.data;
    } catch (error) {
        console.error("Error al obtener las ofertas:", error);
        return { results: [] };
    } finally {
        setLoading(false);
    }
}

async function addOffer(data, token) {
    data.products = data.products.map(product => product.code);

    try {
        await axios.post(
            `${apiUrl}offers/`,
            data,
            authHeader(token)
        );

        return {
            success: true,
            success_message: "Oferta creada con éxito",
        };

    } catch (error) {
        if (error.response) {
            const data = error.response.data;

            const message = data.error

            return {
                success: false,
                status: error.response.status,
                error: message,
            };
        }

        return {
            success: false,
            status: null,
            error: "Error de red o del cliente",
        };
    }
}

async function updateOffer(data, token) {
    data.products = data.products.map(product => product);
    console.log(data);

    try {
        const response = await axios.put(`${apiUrl}offers/${data.id}/`, data, authHeader(token));
        return response.data;
    } catch (error) {
        const message = error.response?.data?.error || 'Error desconocido al actualizar la oferta';
        throw new Error(message);
    }
}

export {
    addOffer,
    fetchOffers,
    updateOffer,
}