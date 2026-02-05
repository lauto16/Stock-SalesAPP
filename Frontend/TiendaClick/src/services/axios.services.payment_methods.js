import axios from 'axios';
import { apiUrl, authHeader } from './consts';

async function fetchPaymentMethods(token) {
  try {
    const response = await axios.get(`${apiUrl}payment-methods/`, authHeader(token));
    return response.data;
  } catch (error) {
    console.error("Error al obtener los medios de pago:", error);
    return { results: [] };
  }
}

export {
  fetchPaymentMethods,
}