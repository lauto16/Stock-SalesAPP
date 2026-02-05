import axios from 'axios';
import { apiUrl, authHeader } from './consts';

async function getAllUsers(token) {
    try {
        const response = await axios.get(`${apiUrl}admin-user-functions/list/`, authHeader(token));

        return response.data;
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        return {
            success: false,
            message:
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Error al obtener los usuarios",
        };
    }
}

async function deleteUser(userId, token) {
    try {
        const response = await axios.delete(`${apiUrl}admin-user-functions/${userId}/delete/`, authHeader(token));

        return response.data;
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        return {
            success: false,
            message:
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Error al eliminar el usuario",
        };
    }
}

async function signupUser({ username, password, role, pin }, token) {
    try {
        const response = await axios.post(`${apiUrl}signup/`, {
            username,
            password,
            role,
            pin
        }, authHeader(token));

        return { success: true }

    } catch (error) {
        if (error.response) {
            return {
                success: false,
                message: error.response.data.error || "Error al crear el usuario"
            };
        }
        console.error(error);
        console.error(error);

        return { success: false, message: "Error de red" };
    }
}

async function loginUser(username, password) {
    try {
        const response = await axios.post(`${apiUrl}login/`, { username, password });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        return { success: false };
    }
}

async function fetchUserData(token) {
    try {

        const response = await axios.get(`${apiUrl}login/me/`, authHeader(token));
        return response.data || null;
    } catch (error) {
        console.error("Error al obtener el rol del usuario:", error);
        return null;
    }
}

export {
    deleteUser,
    getAllUsers,
    signupUser,
    loginUser,
    fetchUserData,
}