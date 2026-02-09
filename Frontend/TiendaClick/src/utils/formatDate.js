
export const formatDate = (isoString) => {
    if (!isoString) return "";
    return isoString.slice(0, 10).replaceAll("-", "/");
};

export const formatHour = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
};
