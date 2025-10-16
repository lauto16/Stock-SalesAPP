import axios from 'axios';

const apiUrl = `http://${window.location.hostname}:8000/api/`;

async function verifyPin(pin, token) {
  try {
    const response = await axios.get(`${apiUrl}login/verify-user-pin/${pin}/`, authHeader(token));
    return { success: response.data?.success === true }
  } catch (error) {
    console.error("Error verificando el PIN:", error);
    return { success: false };
  }
}

async function fetchBlames(page = 1, setLoading, token) {
  try {
    setLoading(true);
    const response = await axios.get(`${apiUrl}blames/?page=${page}`, authHeader(token));
    return response.data;
  } catch (error) {
    console.error("Error al obtener los registros de cambio:", error);
    return { results: [], count: 0 };
  } finally {
    setLoading(false);
  }
}

async function loginUser(username, password) {
  try {
    const response = await fetch(`${apiUrl}login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });


    if (response.ok) {
      const data = await response.json();
      console.log(data);

      return { success: true, data };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error en loginUser:", error);
    return { success: false };
  }
}

function logoutUser(token) {
  return true
}

function authHeader(token) {
  return {
    headers: {
      Authorization: `Token ${token}`,
    },
  };
}

async function addProduct(product, token) {
  return axios.post(`${apiUrl}products/`, product, authHeader(token))
    .then(response => response.data)
    .catch(error => {
      console.error('Error al crear el producto:', error);
      throw error;
    });
}

async function addProvider(provider, token) {
  return axios.post(`${apiUrl}providers/`, provider, authHeader(token))
    .then(response => response.data)
    .catch(error => {
      console.error('Error al crear el producto:', error);
      throw error;
    });
}

async function addOffer(name, endDate, percentage, products, token) {
  const offerData = { name, end_date: endDate, percentage, products };
  try {
    const response = await axios.post(`${apiUrl}offers/`, offerData, authHeader(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Error desconocido al crear la oferta';
    throw new Error(message);
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

async function fetchProviders_by_page({ page = 1, setLoading, token }) {
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

async function fetchSearchBlames(query, token) {
  const url = `${apiUrl}blames/search/?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    if (!response.ok) throw new Error(`Search request failed with status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching blames:", error);
    return null;
  }
}

async function deleteProviderById(id, token) {
  try {
    const response = await axios.delete(`${apiUrl}providers/${id}/`, authHeader(token));
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el proveedor:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

async function fetchSearchProducts(search, token) {
  const url = `${apiUrl}products/search/?q=${encodeURIComponent(search)}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    if (!response.ok) throw new Error(`Search request failed with status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  }
}

async function deleteProductByCode(code, token) {
  try {
    const response = await axios.delete(
      `${apiUrl}products/delete-by-code/${code}/`,
      authHeader(token)
    );
    return response.data;
  } catch (error) {
    const backendError = error.response?.data?.error || "Error al eliminar el producto.";
    return { success: false, error: backendError };
  }
}

async function fetchLowStock({ setLoading, amount = 100 }, token) {
  try {
    setLoading(true);
    const response = await axios.get(`${apiUrl}products/low-stock/${amount}/`, authHeader(token));
    return response.data;
  } catch (error) {
    console.error("Error al obtener el inventario:", error);
    return [];
  } finally {
    setLoading(false);
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
async function updateProvider(updatedData, token) {
  try {
    const id = updatedData.id
    const response = await axios.patch(`${apiUrl}providers/patch-by-id/${id}/`, updatedData, authHeader(token));

    return {
      success: response.data?.success ?? false,
      error: response.data?.error || "",
    };
  } catch (error) {
    const backendError = error.response?.data?.error || error.message || "Error desconocido";
    return { success: false, error: backendError };
  }
}

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

async function fetchUserData(token) {
  try {

    const response = await axios.get(`${apiUrl}login/me/`, authHeader(token));
    console.log(response.data);
    console.log(authHeader(token))
    return response.data || null;
  } catch (error) {
    console.error("Error al obtener el rol del usuario:", error);
    return null;
  }
}

async function signupUser({ username, password, role, pin }, token) {
  try {
    const response = await axios.post(`${apiUrl}signup/`, {
      username,
      password,
      role,
      pin
    }, authHeader(token));

    return { success: true }

  } catch (error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.error || "Error al crear el usuario"
      };
    }
    console.log(error);

    return { success: false, message: "Error de red" };
  }
}

async function fetchSales({ page = 1, setLoading, token }) {
  try {
    setLoading(true);
    const response = await axios.get(`${apiUrl}sales/?page=${page}`, authHeader(token));
    return response.data;
  } catch (error) {
    console.error("Error fetching sales:", error);
    return { results: [], count: 0 };
  } finally {
    setLoading(false);
  }
}

async function fetchSearchSales(search, token) {
  const url = `${apiUrl}sales/search/?q=${encodeURIComponent(search)}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    if (!response.ok) throw new Error(`Search request failed with status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error searching sales:", error);
    return null;
  }
}

async function fetchDownloadExcelFile(token) {
  try {
    const response = await axios.get(`${apiUrl}products/downloadExcel/`, authHeader(token));
    return response.data || null;
  } catch (error) {
    console.error("Error al descargar el archivo Excel:", error);
    return null;
  }
}

async function fetchSalesStats(token) {
  try {
    const response = await axios.get(`${apiUrl}stats/sales-data/`, authHeader(token));
    return response.data || null;
  } catch (error) {
    console.error("Error al pedir los datos estadísticos de las ventas:", error);
    return null;
  }
}

async function fetchEmployeesStats(token) {
  try {
    const response = await axios.get(`${apiUrl}stats/employees-stats/`, authHeader(token));
    return response.data || null;
  } catch (error) {
    console.error("Error al pedir los datos estadísticos de los empleados:", error);
    return null;
  }
}

async function fetchProductsStats(token) {
  try {
    const response = await axios.get(`${apiUrl}stats/products-data/`, authHeader(token));
    return response.data || null;
  } catch (error) {
    console.error("Error al pedir los datos estadísticos de los productos:", error);
    return null;
  }
}

export {
  fetchEmployeesStats,
  fetchProductsStats,
  fetchSearchSales,
  fetchSales,
  fetchSearchProducts,
  addProduct,
  addProvider,
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
  logoutUser,
  fetchProvidersById,
  fetchUserData,
  deleteProviderById,
  fetchSearchBlames,
  fetchBlames,
  verifyPin,
  updateProvider,
  signupUser,
  fetchDownloadExcelFile,
  fetchSalesStats
};
