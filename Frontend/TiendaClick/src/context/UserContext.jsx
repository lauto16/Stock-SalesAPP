import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, logoutUser } from "../services/axios.services";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const loginUserContext = async ({ username, password, setLoading }) => {
    const result = await loginUser({ username, password, setLoading });

    if (result.success) {
      const userData = {
        ...result.data,
        isAuthenticated: true,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }

    return result;
  };

  const logout = () => {
    logoutUser()
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, setUser, loginUserContext, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);