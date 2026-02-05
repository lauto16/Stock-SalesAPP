import axios from 'axios';
import { apiUrl, authHeader } from './consts';

async function fetchSearchBlames(query, token) {
    try {
        const response = await axios.get(
            `${apiUrl}blames/search/?q=${encodeURIComponent(query)}`,
            authHeader(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching blames:", error);
        return [];
    }
}

async function fetchBlames(page = 1, setLoading, token) {
    try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}blames/?page=${page}`, authHeader(token));
        return response.data;
    } catch (error) {
        console.error("Error al obtener los registros de cambio:", error);
        return { results: [], count: 0 };
    } finally {
        setLoading(false);
    }
}


export {
    fetchSearchBlames,
    fetchBlames,
}