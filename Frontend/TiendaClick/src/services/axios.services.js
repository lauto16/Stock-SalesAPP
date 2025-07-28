import axios from 'axios';

const apiUrl = `http://${window.location.hostname}:8000/api/`;

async function getProviders() {
  return axios.get(`${apiUrl}providers/`);
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

async function fetchProducts({ page = 1, search = "", setLoading }) {
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
    return response.data; // contiene tanto `results` como `count`
  } catch (error) {
    console.error("Error al obtener el inventario:", error);
    return { results: [], count: 0 };
  } finally {
    setLoading(false);
  }
}

export {
  fetchSearchProducts,
  addProduct,
  getProviders,
  fetchProducts,
  fetchLowStock,
  deleteProductByCode
}