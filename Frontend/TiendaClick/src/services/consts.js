export const apiUrl = `http://${window.location.hostname}:8000/api/`;
export function authHeader(token) {
    return {
        headers: {
            Authorization: `Token ${token}`,
        }
    };
}