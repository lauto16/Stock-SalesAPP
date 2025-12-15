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
    const response = await axios.post(`${apiUrl}login/`, { username, password });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
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
  console.log(product)
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

async function addOffer(data, token) {
  data.products = data.products.map(product => product.code);
  try {
    console.log(data)
    const response = await axios.post(`${apiUrl}offers/`, data, authHeader(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Error desconocido al crear la oferta';
    throw new Error(message);
  }
}
//TODO revisar que esté bien
async function updateOffer(data, token) {
  data.products = data.products.map(product => product);

  console.log(data)
  try {
    const response = await axios.put(`${apiUrl}offers/${data.id}/`, data, authHeader(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Error desconocido al actualizar la oferta';
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
  try {
    const response = await axios.get(
      `${apiUrl}blames/search/?q=${encodeURIComponent(query)}`,
      authHeader(token)
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching blames:", error);
    return [];
  }
}

async function deleteProviderById(id, token) {
  try {
    const response = await axios.delete(`${apiUrl}providers/delete-by-id/${id}/`, authHeader(token));
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el proveedor:", error.response?.data || error.message);
    throw error.response?.data || error;
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
    console.log(updatedData)
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

async function fetchSearchSales(search, setLoading, token) {
  try {
    setLoading(true);
    const response = await axios.get(
      `${apiUrl}sales/search/?q=${encodeURIComponent(search)}`,
      authHeader(token)
    );
    return response.data;
  } catch (error) {
    console.error("Error searching sales:", error);
    return [];
  } finally {
    setLoading(false);
  }
}

async function deleteSaleById(id, token) {
  try {
    const response = await axios.delete(
      `${apiUrl}sales/delete-by-id/${id}/`,
      authHeader(token)
    );
    console.log(response);
    return response.data;
  } catch (error) {
    const backendError = error.response?.data?.error || "Error al eliminar la venta.";
    return { success: false, error: backendError };
  }
}

async function addSale(formData, token) {
  console.log("Raw form data:", formData);

  // Calculate discount and final price
  const chargePercentage = parseFloat(formData.applied_charge_percentage);

  // Build items array with product_id and quantity
  const items = formData.selectedProducts.map((product) => ({
    product_id: product.code,
    quantity: parseFloat(formData[`quantity_${product.code}`])
  }));

  // Prepare the payload for backend
  const saleData = {
    payment_method: formData.payment_method,
    applied_charge_percentage: chargePercentage,
    charge_reason: formData.charge_reason,
    initial_price: null,
    total_price: null,
    items: items
  };

  console.log("Transformed sale data:", saleData);

  return axios.post(`${apiUrl}sales/`, saleData, authHeader(token))
    .then(response => response.data)
    .catch(error => {
      console.error('Error al crear la venta:', error);
      throw error;
    });
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


async function getAllUsers(token) {
  try {
    const response = await axios.get(`${apiUrl}admin-user-functions/list/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return {
      success: false,
      message:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Error al obtener los usuarios",
    };
  }
}

async function deleteUser(userId, token) {
  try {
    const response = await axios.delete(`${apiUrl}admin-user-functions/${userId}/delete/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return {
      success: false,
      message:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Error al eliminar el usuario",
    };
  }
}

async function fetchOffers({ page = 1, setLoading, token }) {
  try {
    setLoading(true);
    const response = await axios.get(`${apiUrl}offers/?page=${page}`, authHeader(token));
    return response.data;
  } catch (error) {
    console.error("Error al obtener las ofertas:", error);
    return { results: [] };
  } finally {
    setLoading(false);
  }
}
async function fetchPaymentMethods(token) {
  try {
    const response = await axios.get(`${apiUrl}payment-methods/`, authHeader(token));
    return response.data;
  } catch (error) {
    console.error("Error al obtener los medios de pago:", error);
    return { results: [] };
  }
}
async function fetchCategories(setLoading, token) {
  setLoading(true);
  try {
    const response = await axios.get(`${apiUrl}categories/`, authHeader(token));
    setLoading(false);

    return response.data;
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
    setLoading(false);
    return { results: [] };
  }
}
async function addCategory(category, token) {
  return axios.post(`${apiUrl}categories/`, category, authHeader(token));
}
async function updateCategory(category, token) {
  return axios.put(`${apiUrl}categories/${category.id}/`, category, authHeader(token));
}
async function deleteCategory(category, token) {
  return axios.delete(`${apiUrl}categories/${category}/`, authHeader(token));
}
// STATISTICS FUNCTIONS
// returns the average value of the sales
async function fetchSalesAverageValueStatsByPeriod(token, period) {
  return axios.get(`${apiUrl}sales_stats/average-sales-value/${period}`, authHeader(token));
}
// returns the most used payment methods
async function fetchMostUsedPaymentMethodsStatsByPeriod(token, period) {
  return axios.get(`${apiUrl}sales_stats/most-used-payment-methods/${period}`, authHeader(token));
}

// returns the best sellers (products)
async function fetchBestSellingProducts(token, period, count) {
  return axios.get(`${apiUrl}sales_stats/best-selling-products/${period}?count=${count}`, authHeader(token));
}

// returns the products with higher gain margin
async function fetchHigherMarginProducts(token, count) {
  return axios.get(`${apiUrl}products_stats/higher-margin-products/?count=${count}`, authHeader(token));
}

// returns the products with lower gain margin
async function fetchLowerMarginProducts(token, count) {
  return axios.get(`${apiUrl}products_stats/lower-margin-products/?count=${count}`, authHeader(token));
}

// returns the 24 hrs of the day followed by the amount of sales made in each hour historically
async function fetchBestSellingHours(token) {
  return axios.get(`${apiUrl}sales_stats/best-selling-hours/`, authHeader(token));
}

// returns each employee name followed by their sales
async function fetchEmployeeSales(token) {
  return axios.get(`${apiUrl}employees_stats/employees-sales/`, authHeader(token));
}

// returns all categories and the amount of sales for each one
async function fetchBestSellingCategories(token) {
  return axios.get(`${apiUrl}products_stats/best-selling-categories/`, authHeader(token));
}

// STATISTICS FUNCTIONS DASHBOARD
async function fetchSalesStats(token) {
  try {
    const response = await axios.get(`${apiUrl}sales_stats/sales-stats`, authHeader(token));
    return response.data || null;
  } catch (error) {
    console.error("Error al pedir los datos estadísticos de las ventas:", error);
    return null;
  }
}

async function fetchEmployeesStats(token) {
  try {
    const response = await axios.get(`${apiUrl}employees_stats/employees-stats/`, authHeader(token));
    return response.data || null;
  } catch (error) {
    console.error("Error al pedir los datos estadísticos de los empleados:", error);
    return null;
  }
}

async function fetchProductsStats(token) {
  try {
    const response = await axios.get(`${apiUrl}products_stats/products-stats/`, authHeader(token));
    return response.data || null;
  } catch (error) {
    console.error("Error al pedir los datos estadísticos de los productos:", error);
    return null;
  }
}

export {
  deleteUser,
  getAllUsers,
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
  fetchSalesStats,
  deleteSaleById,
  addSale,
  fetchOffers,
  updateOffer,
  fetchSalesAverageValueStatsByPeriod,
  fetchMostUsedPaymentMethodsStatsByPeriod,
  fetchPaymentMethods,
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  fetchBestSellingProducts,
  fetchHigherMarginProducts,
  fetchBestSellingHours,
  fetchEmployeeSales,
  fetchLowerMarginProducts,
  fetchBestSellingCategories
};
