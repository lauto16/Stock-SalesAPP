import axios from 'axios';
import { apiUrl, authHeader } from './consts';

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
        console.log(response);

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

export {
    fetchSalesAverageValueStatsByPeriod,
    fetchMostUsedPaymentMethodsStatsByPeriod,
    fetchBestSellingProducts,
    fetchHigherMarginProducts,
    fetchLowerMarginProducts,
    fetchBestSellingHours,
    fetchEmployeeSales,
    fetchBestSellingCategories,
    fetchSalesStats,
    fetchEmployeesStats,
    fetchProductsStats,
    fetchLowStock,

}