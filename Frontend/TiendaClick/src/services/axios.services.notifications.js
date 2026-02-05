import axios from 'axios';
import { apiUrl, authHeader } from './consts';

async function fetchUnseenNotifications(token) {
    try {
        const response = await axios.get(
            `${apiUrl}notifications/unseen/`,
            authHeader(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        return { success: false, data: [] };
    }
}

async function fetchSeenNotifications(token) {
    try {
        const response = await axios.get(
            `${apiUrl}notifications/seen/`,
            authHeader(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        return { success: false, data: [] };
    }
}

async function markNotificationAsSeen(id, token) {
    try {
        const response = await axios.post(
            `${apiUrl}notifications/${id}/mark_as_seen/`,
            {},
            authHeader(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error al marcar notificación como vista:", error);
        return { success: false };
    }
}

async function deleteNotificationById(id, token) {
    try {
        const response = await axios.delete(
            `${apiUrl}notifications/${id}/`,
            authHeader(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error al eliminar notificación:", error);
        return { success: false };
    }
}

export {
    fetchUnseenNotifications,
    fetchSeenNotifications,
    deleteNotificationById,
    markNotificationAsSeen,
}