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

export {
  addProduct,
  getProviders
}