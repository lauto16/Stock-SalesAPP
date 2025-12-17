import { apiUrl, authHeader } from './consts';
import axios from 'axios';

export async function fetchSalesDownloadExcel(token) {
    const response = await axios.get(`${apiUrl}sales_download_excel/`);

    if (response.data.success) {
        const fileUrl = response.data.file_path;
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", "");
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}