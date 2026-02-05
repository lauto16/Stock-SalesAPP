import { useEffect, useState } from "react";
import { fetchSearchProducts } from "../../services/axios.services.products.js";
export function useProducts(token) {
    const [products, setProducts] = useState([])
    useEffect(() => {
        fetchSearchProducts(token)
            .then((res) => { setProducts(res.data) })
            .catch((err) => console.error('Error, no se pudieron cargar los datos: ', err))
    }, [])
    return {
        products,
        setProducts
    }
}