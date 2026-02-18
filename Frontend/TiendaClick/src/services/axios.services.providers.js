import axios from 'axios';
import { apiUrl, authHeader } from './consts';

async function fetchProvidersByPage({ page = 1, setLoading, token }) {
    try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}providers/?page=${page}`, authHeader(token));
        return response.data;
    } catch (error) {
        console.error("Error al obtener los proveedores:", error);
        return { results: [], count: 0 };
    } finally {
        setLoading(false);
    }
}

async function fetchProviders(token) {
    return axios.get(`${apiUrl}providers/all/`, authHeader(token));
}

async function fetchProvidersById(id, token) {
    return axios.get(`${apiUrl}providers/${id}/`, authHeader(token));

}

async function deleteProviderById(id, token) {
    try {
      await axios.delete(
        `${apiUrl}providers/delete-by-id/${id}/`,
        authHeader(token)
      );
  
      return {
        success: true,
        success_message: "Proveedor eliminado con éxito"
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

async function updateProvider(updatedData, token) {
    try {
        const id = updatedData.id
        const response = await axios.patch(`${apiUrl}providers/patch-by-id/${id}/`, updatedData, authHeader(token));
        return response.data
    } catch (error) {
        const backendError = error.response?.data?.error || error.message || "Error desconocido";
        return { success: false, error: backendError };
    }
}

async function addProvider(provider, token) {
    try {
        await axios.post(
            `${apiUrl}providers/`,
            provider,
            authHeader(token)
        );

        return {
            success: true,
            success_message: "Proveedor creado con éxito",
        };

    } catch (error) {
        if (error.response) {
            const data = error.response.data;

            let message = "Error desconocido";

            if (typeof data === "object") {
                const firstKey = Object.keys(data)[0];
                const value = data[firstKey];

                if (Array.isArray(value)) {
                    message = value[0];
                } else {
                    message = value;
                }
            }

            return {
                success: false,
                status: error.response.status,
                error: message,
            };
        }

        return {
            success: false,
            status: null,
            error: "Error de red o del cliente",
        };
    }
}

export {
    addProvider,
    fetchProviders,
    fetchProvidersByPage,
    updateProvider,
    fetchProvidersById,
    deleteProviderById,
}