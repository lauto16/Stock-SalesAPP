import axios from 'axios';
import { apiUrl, authHeader } from './consts';

async function fetchCategories(setLoading, token) {
  try {
    const response = await axios.get(
      `${apiUrl}categories/`,
      authHeader(token)
    );

    const { success, error, data } = response.data;

    if (!success) {
      return { success: false, error };
    }

    return {
      success: true,
      error: "",
      data: Array.isArray(data) ? data : []
    };

  } catch (err) {
    return {
      success: false,
      error: err?.message || "Error al obtener categorías",
    };
  }
}

async function addCategory(category, token) {
  try {
    await axios.post(`${apiUrl}categories/`, category, authHeader(token));

    return {
      success: true,
      success_message: "Categoría creada con éxito"
    };
  } catch (error) {
    if (error.response) {
      const data = error.response.data;
      let message = "Error desconocido";

      if (typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        message = data[firstKey];
        console.log(error);

        return {
          success: false,
          status: error.response.status,
          error: message,
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

async function updateCategory(category, token) {
  try {
    const response = await axios.put(
      `${apiUrl}categories/${category.id}/`,
      category,
      authHeader(token)
    );

    return response.data

  } catch (error) {
    const backendError = error.response?.data?.error || error.message || "Error desconocido";
    return { success: false, error: backendError };
}
}

async function deleteCategory(category, token) {
  try {
    await axios.delete(
      `${apiUrl}categories/${category}/`,
      authHeader(token)
    );

    return {
      success: true,
      success_message: "Categoría eliminada con éxito"
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

export {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
}