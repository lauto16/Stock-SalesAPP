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
    const response = await axios.get(`${apiUrl}products/?page=${page}&search=${search}`);
    return response.data; // contiene tanto `results` como `count`
  } catch (error) {
    console.error("Error al obtener el inventario:", error);
    return { results: [], count: 0 };
  } finally {
    setLoading(false);
  }
}

export {
  addProduct,
  getProviders,
  fetchProducts
}