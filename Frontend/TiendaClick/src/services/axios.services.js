import axios from 'axios';

const apiUrl = `http://${window.location.hostname}:8000/api/`;

async function loginUser(username, password) {
  try {
      const response = await fetch(`${apiUrl}login/`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
          const data = await response.json();
          return { success: true, data };
      } else {
          return { success: false };
      }
  } catch (error) {
      console.error("Error en loginUser:", error);
      return { success: false };
  }
}

async function logoutUser() {
  try {
      const response = await fetch(`${apiUrl}logout/`, {
          method: "POST",
          credentials: "include",
      });
      return response.ok;
  } catch (error) {
      console.error("Error en logoutUser:", error);
      return false;
  }
}

async function addProduct(code, name, stock, sell_price, buy_price, provider) {

  const productData = {
    code,
    name,
    stock,
    sell_price,
    buy_price,
    provider
  };

  return axios.post(`${apiUrl}products/`, productData)
    .then(response => {
      console.log('Product created:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Error al crear el producto:', error);
      throw error;
    });
}

async function addOffer(name, endDate, percentage, products) {
  const offerData = {
    name: name,
    end_date: endDate,
    percentage: percentage,
    products: products,
  };

  try {
    const response = await axios.post(`${apiUrl}offers/`, offerData);
    console.log('Offer created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear la oferta:', error);
    const message =
      error.response?.data?.error ||
      'Error desconocido al crear la oferta';
    throw new Error(message);
  }
}

async function fetchProducts({ page = 1, setLoading }) {
  try {
    setLoading(true);
    const response = await axios.get(`${apiUrl}products/?page=${page}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el inventario:", error);
    return { results: [], count: 0 };
  } finally {
    setLoading(false);
  }
}


async function fetchProviders_by_page({ page = 1, setLoading }) {
  try {
    setLoading(true);
    const response = await axios.get(`${apiUrl}providers/?page=${page}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los proveedores:", error);
    return { results: [], count: 0 };
  } finally {
    setLoading(false);
  }
}

async function fetchProviders() {
  return axios.get(`${apiUrl}providers/all/`);
}

async function fetchSearchProducts(search) {
  const url = `${apiUrl}products/search/?q=${encodeURIComponent(search)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Search request failed with status: ${response.status}`);
    }
    const products = await response.json();
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  }
}

async function deleteProductByCode(code) {
  try {
    const response = await axios.delete(`${apiUrl}products/delete-by-code/${code}/`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el producto:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

async function fetchLowStock({ setLoading, amount = 100 }) {
  // amount -> quantity of products to get, max 150
  try {
    setLoading(true);
    const response = await axios.get(`${apiUrl}products/low-stock/${amount}/`);
    return response.data;

  } catch (error) {
    console.error("Error al obtener el inventario:", error);
    return [];
  } finally {
    setLoading(false);
  }
}

async function fetchGetByCode(code) {
  const response = await axios.get(`${apiUrl}products/get-by-code/${code}/`);
  return response.data;
};

async function updateProduct(oldCode, updatedData) {
  try {
    const response = await axios.patch(`${apiUrl}products/patch-by-code/${oldCode}/`, updatedData);
    if (response.data && typeof response.data.success === "boolean") {
      return {
        success: response.data.success,
        error: response.data.error || "",
      };
    } else {
      return {
        success: false,
        error: "Respuesta inesperada del servidor",
      };
    }
  } catch (error) {
    const backendError = error.response?.data?.error || error.message || "Error desconocido";
    return {
      success: false,
      error: backendError,
    };
  }
}

async function updateSelectedPrices(data, selectedItems) {
  try {
    const codes = Array.from(selectedItems.keys());
    const payload = {
      ...data,
      codes,
    };

    const response = await axios.patch(`${apiUrl}products/patch-selected-prices/`, payload);
    if (response.data && typeof response.data.success === "boolean") {
      return {
        success: response.data.success,
        error: response.data.error || "",
      };
    } else {
      return {
        success: false,
        error: "Respuesta inesperada del servidor",
      };
    }
  } catch (error) {
    const backendError = error.response?.data?.error || error.message || "Error desconocido";
    return {
      success: false,
      error: backendError,
    };
  }
}

async function updateAllPrices(data) {
  try {
    const response = await axios.patch(`${apiUrl}products/patch-all-prices/`, data);
    if (response.data && typeof response.data.success === "boolean") {
      return {
        success: response.data.success,
        error: response.data.error || "",
      };
    } else {
      return {
        success: false,
        error: "Respuesta inesperada del servidor",
      };
    }
  } catch (error) {
    const backendError = error.response?.data?.error || error.message || "Error desconocido";
    return {
      success: false,
      error: backendError,
    };
  }
}



export {
  fetchSearchProducts,
  addProduct,
  fetchProviders,
  fetchProducts,
  fetchLowStock,
  deleteProductByCode,
  fetchGetByCode,
  updateProduct,
  updateAllPrices,
  updateSelectedPrices,
  fetchProviders_by_page,
  addOffer,
  loginUser,
  logoutUser
}