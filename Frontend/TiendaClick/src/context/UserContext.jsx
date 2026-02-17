import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, fetchUserData } from "../services/axios.services.auth.js";

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

    const updateUserData = async () => {
        console.log('updating user');
        
        if (user?.token) {
            const user_data = await fetchUserData(user.token);
            if (user_data) {
                const role = user_data.role_name_sp
                const permissions = user_data.permissions
                const askForPin = user_data.askForPin
                const allowedStockDecrease = user_data.allowedStockDecrease
                setUser((prev) => ({ ...prev, role, permissions, askForPin, allowedStockDecrease }));
            }
        }
    };

    useEffect(() => {
        updateUserData();
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
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, login, setUser, logout, updateUserData }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);