import { apiUrl, authHeader } from './consts';
import axios from 'axios';
import { downloadFile } from "./consts.js"
export async function fetchSalesDownloadExcel(token) {
    try {
        const response = await axios.get(`${apiUrl}sales_download_excel/`,
            { responseType: "blob", ...authHeader(token) });
        downloadFile(response.data, "ventas.xlsx");

        return true;
    } catch (error) {
        console.error("Error al descargar el Excel de ventas:", error);
        return false;
    }
}
export async function fetchProductsDownloadExcel(token) {
    try {
        const response = await axios.get(`${apiUrl}products/products_download_excel/`,
            { responseType: "blob", ...authHeader(token) });
        downloadFile(response.data, "inventario.xlsx");

        return true;
    } catch (error) {
        console.error("Error al descargar el Excel de productos:", error);
        return false;
    }
}
