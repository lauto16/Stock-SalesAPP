import axios from 'axios';

export default async function getProviders() {
    return axios.get(`${apiUrl}/providers/`);
  }

export async function addProduct(code, name, stock, sell_price, buy_price) {
  const apiUrl = `http://${window.location.hostname}:8000/api/products/`;

  const productData = {
    code,
    name,
    stock,
    sell_price,
    buy_price
  };

  return axios.post(apiUrl, productData)
    .then(response => {
      console.log('Product created:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Error al crear el producto:', error);
      throw error;
    });
}