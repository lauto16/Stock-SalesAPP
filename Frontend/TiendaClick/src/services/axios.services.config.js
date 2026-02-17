import axios from 'axios';
import { apiUrl, authHeader } from './consts';

async function getAreUsersAllowedToDecideStockDecrease(token){

        try {
            const response = await axios.get(`${apiUrl}admin-user-functions/get-are-users-allowed-to-decide-stock-decrease/`, authHeader(token));
            return response.data || false;
        } catch (error) {
            console.error("Error al consultar si los usuarios pueden decidir si la disminucion de stock genera perdidas:", error);
            return false;
        }
    }



async function updateAreUsersAllowedToDecideStockDecrease(areUsersAllowed, token) {
    
        try {
            const response = await axios.patch(
                `${apiUrl}admin-user-functions/update-are-users-allowed-stock-decrease/`,
                { areUsersAllowed },
                authHeader(token)
            );
    
            return response.data;
        } catch (error) {
            console.error("Error al actualizar la petición del pin:", error);
            return { success: false };
        }
    }


    async function getCreateLossWhenProductDelete(token) {
        try {
            const response = await axios.get(
                `${apiUrl}admin-user-functions/get-create-loss-when-product-delete/`,
                authHeader(token)
            );
    
            return response.data || false;
    
        } catch (error) {
            console.error(
                "Error al consultar si eliminar un producto genera pérdida económica:",
                error
            );
            return false;
        }
    }
    
    
    async function updateCreateLossWhenProductDelete(createLossWhenProductDelete, token) {
        try {
            const response = await axios.patch(
                `${apiUrl}admin-user-functions/update-create-loss-when-product-delete/`,
                { createLossWhenProductDelete },
                authHeader(token)
            );
    
            return response.data;
    
        } catch (error) {
            console.error(
                "Error al actualizar la configuración de pérdida al eliminar producto:",
                error
            );
            return { success: false };
        }
    }

export {
    getAreUsersAllowedToDecideStockDecrease,
    updateAreUsersAllowedToDecideStockDecrease,
    getCreateLossWhenProductDelete,
    updateCreateLossWhenProductDelete
}