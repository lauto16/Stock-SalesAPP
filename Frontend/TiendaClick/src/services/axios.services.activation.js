import axios from 'axios';
import { apiUrl, authHeader } from './consts';

async function getActivationStatus(token) {
    try {
        const response = await axios.get(
            `${apiUrl}activations/`,
            authHeader(token)
        );

        return {
            isActivated: response.data?.isActivated === true,
            remainingTime: response.data?.remainingTime || 0
        };

    } catch (error) {
        console.error("Error obteniendo estado de activación:", error);
        return {
            isActivated: false,
            remainingTime: 0
        };
    }
}


async function activateLicense(key, token) {
    try {
        const response = await axios.post(
            `${apiUrl}activation/activate/`,
            { key },
            authHeader(token)
        );

        return {
            success: response.data?.success === true
        };

    } catch (error) {
        console.error("Error activando licencia:", error);
        return { success: false };
    }
}

export { activateLicense, getActivationStatus }