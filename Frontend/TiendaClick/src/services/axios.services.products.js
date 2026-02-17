import axios from 'axios';
import { apiUrl, authHeader } from './consts';

async function updateSelectedPrices(data, selectedItems, token) {
  try {
    const codes = Array.from(selectedItems.keys());
    const payload = { ...data, codes };
    const response = await axios.patch(`${apiUrl}products/patch-selected-prices/`, payload, authHeader(token));
    return {
      success: response.data?.success ?? false,
      error: response.data?.error || "",
    };
  } catch (error) {
    const backendError = error.response?.data?.error || error.message || "Error desconocido";
    return { success: false, error: backendError };
  }
}

async function updateAllPrices(data, token) {
  try {
    const response = await axios.patch(`${apiUrl}products/patch-all-prices/`, data, authHeader(token));
    return {
      success: response.data?.success ?? false,
      error: response.data?.error || "",
    };
  } catch (error) {
    const backendError = error.response?.data?.error || error.message || "Error desconocido";
    return { success: false, error: backendError };
  }
}

async function fetchGetByCode(code, token) {
  const response = await axios.get(`${apiUrl}products/get-by-code/${code}/`, authHeader(token));
  return response.data;
}

async function updateProduct(oldCode, updatedData, token) {
  try {
    const response = await axios.patch(`${apiUrl}products/patch-by-code/${oldCode}/`, updatedData, authHeader(token));
    return {
      success: response.data?.success ?? false,
      error: response.data?.error || "",
    };
  } catch (error) {
    const backendError = error.response?.data?.error || error.message || "Error desconocido";
    return { success: false, error: backendError };
  }
}

async function fetchSearchProducts(search, token) {
  try {
    const response = await axios.get(
      `${apiUrl}products/search/?q=${encodeURIComponent(search)}`,
      authHeader(token)
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

async function deleteProductByCode(code, token) {
  try {
    await axios.delete(
      `${apiUrl}products/delete-by-code/${code}/`,
      authHeader(token)
    );

    return {
      success: true,
      success_message: "Producto eliminado con éxito"
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

async function fetchProducts({ page = 1, setLoading, token }) {
  try {
    setLoading(true);
    const response = await axios.get(`${apiUrl}products/?page=${page}`, authHeader(token));
    return response.data;
  } catch (error) {
    console.error("Error al obtener el inventario:", error);
    return { results: [], count: 0 };
  } finally {
    setLoading(false);
  }
}

async function addProduct(product, token) {
  try {
    await axios.post(`${apiUrl}products/`, product, authHeader(token))
    return {
      success: true,
      success_message: "Producto creado con éxito"
    }
  } catch (error) {
    if (error.response) {
      const data = error.response.data;

      let value = "Error desconocido";

      if (typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        value = data[firstKey];

        console.log(error);


        return {
          success: false,
          status: error.response.status,
          error: value,
        }
      }

      return {
        success: false,
        status: null,
        error: "Error de red o del cliente",
      }
    }
  }
}

export {
  fetchProducts,
  deleteProductByCode,
  fetchGetByCode,
  updateProduct,
  updateAllPrices,
  updateSelectedPrices,
  addProduct,
  fetchSearchProducts,

}