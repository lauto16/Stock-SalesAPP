import axios from 'axios';
import { apiUrl, authHeader } from './consts';

async function verifyPin(pin, token) {
    try {
        const response = await axios.get(`${apiUrl}login/verify-user-pin/${pin}/`, authHeader(token));
        return { success: response.data?.success === true }
    } catch (error) {
        console.error("Error verificando el PIN:", error);
        return { success: false };
    }
}

async function updateAskForPin(askForPin, token) {
    // changes all users askforpin register to AskForPin bool parameter.
    
    try {
        const response = await axios.patch(
            `${apiUrl}admin-user-functions/ask-for-pin/`,
            { askForPin },
            authHeader(token)
        );

        return response.data;
    } catch (error) {
        console.error("Error al actualizar la petición del pin:", error);
        return { success: false };
    }
}

async function getAskForPin(token) {
    try {
        const response = await axios.get(`${apiUrl}admin-user-functions/get-ask-for-pin/`, authHeader(token));
        return response.data || false;
    } catch (error) {
        console.error("Error al pedir el valor de la opcionalidad del pin:", error);
        return false;
    }
}

export {
    verifyPin,
    updateAskForPin,
    getAskForPin
}