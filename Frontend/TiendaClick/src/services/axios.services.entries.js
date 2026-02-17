import axios from 'axios';
import { apiUrl, authHeader } from './consts';


export async function addEntry(formData, token) {
    console.log("formData", formData);

    const details = formData.selectedProducts.map((product) => ({
        product_id: product.code,
        quantity: parseFloat(formData[`quantity_${product.code}`]),
        unit_price: parseFloat(formData[`unit_price_${product.code}`]),
        applied_charge: 0
    }));

    const entryData = {
        rute_number: formData.rute_number,
        details: details
    };

    console.log("entryData", entryData);

    try {
        await axios.post(
            `${apiUrl}entries/`,
            entryData,
            authHeader(token)
        );

        return {
            success: true,
            success_message: "Ingreso creado con éxito"
        };

    } catch (error) {
        if (error.response) {
            const data = error.response.data;

            let value = "Error desconocido";

            if (typeof data === "object") {
                const firstKey = Object.keys(data)[0];
                value = data[firstKey];

                console.error(error.response);

                return {
                    success: false,
                    status: error.response.status,
                    error: value,
                };
            }
        }

        return {
            success: false,
            status: null,
            error: "Error de red o del cliente",
        };
    }
}


export async function deleteEntryById(id, token) {
    try {
      await axios.delete(
        `${apiUrl}entries/delete-by-id/${id}/`,
        authHeader(token)
      );
  
      return {
        success: true,
        success_message: "Ingreso eliminado con éxito"
      };
  
    } catch (error) {
      if (error.response) {
        const data = error.response.data;
        let value = "Error desconocido";
  
        return {
          success: false,
          status: error.response.status,
          error: data?.error || value,
        };
      }
  
      return {
        success: false,
        status: null,
        error: "Error del servidor",
      };
    }
  }

export async function fetchEntries({ page = 1, setLoading, token }) {
    try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}entries/?page=${page}`, authHeader(token));
        return response.data;
    } catch (error) {
        console.error("Error al obtener las entradas:", error);
        return { results: [], count: 0 };
    } finally {
        setLoading(false);
    }
}

