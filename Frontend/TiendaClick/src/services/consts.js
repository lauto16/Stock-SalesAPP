export const apiUrl = `http://${window.location.hostname}:8000/api/`;

export function authHeader(token) {
    return {
        headers: {
            Authorization: `Token ${token}`,
        }
    };
}

export function downloadFile(data, name) {
    const blob = new Blob(
        [data],
        { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
}