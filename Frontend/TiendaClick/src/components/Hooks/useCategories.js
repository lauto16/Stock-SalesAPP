import { useEffect, useState } from "react";
import { fetchCategories } from "../../services/axios.services";
export function useCategories(token) {
    const [categories, setCategories] = useState([])
    useEffect(() => {
        fetchCategories(token)
            .then((res) => { setCategories(res) })
            .catch((err) => console.error('Error, no se pudieron cargar los datos: ', err))
    }, [])
    return {
        categories,
        setCategories
    }
}