import { useEffect, useState } from "react";
import { fetchProviders } from "../../../services/axios.services";
export function useProviders(dependencies) {
    const [providers, setProviders] = useState([])
    useEffect(() => {
        fetchProviders()
            .then((res) => setProviders(res.data))
            .catch((err) => handleBeforeClose('error', 'No se pudieron cargar los datos'))
    }, dependencies)
    return {
        providers,
        setProviders
    }
}