import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser, fetchUserData } from "../services/axios.services";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    useEffect(() => {
        const getRoleName = async () => {
            if (user?.token && !user.role) {
                const user_data = await fetchUserData(user.token);
                if (user_data) {
                    const role = user_data.role_name_sp
                    const permissions = user_data.permissions
                    setUser((prev) => ({ ...prev, role, permissions }));
                }
            }
        };

        getRoleName();
    }, [user?.token]);

    const login = async ({ username, password }) => {
        const response = await loginUser(username, password);
        if (response.success) {
            setUser({ username, token: response.data.token });
            return { success: true };
        } else {
            return { success: false };
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