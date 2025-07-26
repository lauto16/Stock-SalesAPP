import { createContext, useContext, useState } from "react";

// 1. Crear el contexto
const UserContext = createContext(null);

// 2. Componente proveedor
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        name: "Juan Pérez",
        role: "admin",
        avatar: "/user.svg",
    });

    // login/logout logic 

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
