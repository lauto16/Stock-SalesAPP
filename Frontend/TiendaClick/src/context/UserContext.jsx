import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser } from "../services/axios.services";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    const login = async ({ username, password }) => {
        try {
            const response = await loginUser(username, password);
            if (response.success) {
                setUser(response.data);
                return { success: true, data: response.data };
            } else {
                return { success: false };
            }
        } catch (error) {
            console.error("Error al hacer login:", error);
            return { success: false };
        } finally {
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
        } catch (e) {
            console.error("Error cerrando sesión:", e);
        }
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);