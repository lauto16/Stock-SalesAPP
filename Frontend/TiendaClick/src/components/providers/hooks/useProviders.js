import { useEffect, useState } from "react";
import { fetchProviders } from "../../../services/axios.services";
export function useProviders(token, dependencies) {
    const [providers, setProviders] = useState([])
    useEffect(() => {
        fetchProviders(token)
            .then((res) => setProviders(res.data))
            .catch((err) => console.error('Error, no se pudieron cargar los datos: ', err))
    }, dependencies || [])
    return {
        providers,
        setProviders
    }
}