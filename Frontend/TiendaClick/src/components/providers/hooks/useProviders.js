import { useEffect, useState } from "react";
import { fetchProviders } from "../../../services/axios.services.providers.js";
export function useProviders(token) {
    const [providers, setProviders] = useState([])
    useEffect(() => {
        fetchProviders(token)
            .then((res) => setProviders(res.data))
            .catch((err) => console.error('Error, no se pudieron cargar los datos: ', err))
    }, [])
    return {
        providers,
        setProviders
    }
}