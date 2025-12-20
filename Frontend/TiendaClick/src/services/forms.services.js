import { apiUrl, authHeader } from './consts';
import axios from 'axios';

export async function fetchSalesDownloadExcel(token) {
    try {
        const response = await axios.get(`${apiUrl}sales_download_excel/`,
            { responseType: "blob", ...authHeader(token) });
        const blob = new Blob(
            [response.data],
            { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
        );

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "ventas.xlsx";
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error("Error al descargar el Excel de ventas:", error);
        return false;
    }
}
