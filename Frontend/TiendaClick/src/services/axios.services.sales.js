import axios from 'axios';
import { apiUrl, authHeader } from './consts';

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
    await axios.delete(
      `${apiUrl}sales/delete-by-id/${id}/`,
      authHeader(token)
    );

    return {
      success: true,
      success_message: "Venta eliminada con éxito"
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
      status: error.response.status,
      error: "Error del servidor",
    };
  }
}

async function addSale(formData, token) {
  try {
    const chargePercentage = parseFloat(formData.applied_charge_percentage);

    const items = formData.selectedProducts.map((product) => ({
      product_id: product.code,
      quantity: parseFloat(formData[`quantity_${product.code}`])
    }));

    const saleData = {
      payment_method: formData.payment_method,
      applied_charge_percentage: chargePercentage,
      charge_reason: formData.charge_reason,
      initial_price: null,
      total_price: null,
      items: items
    };

    await axios.post(`${apiUrl}sales/`, saleData, authHeader(token));

    return {
      success: true,
      success_message: "Venta creada con éxito"
    };
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

export {
  addSale,
  fetchSales,
  deleteSaleById,
  fetchSearchSales,
}