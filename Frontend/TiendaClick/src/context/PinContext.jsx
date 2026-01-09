import { createContext, useContext, useState, useEffect } from "react";
import { verifyPin, updateAskForPin } from "../services/axios.services";
import { useUser } from "./UserContext";
const PinContext = createContext();

export function usePin() {
  return useContext(PinContext);
}

export function PinProvider({ children }) {
  const [pinVerified, setPinVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const { user } = useUser();
  const [pinDisabled, setPinDisabled] = useState(false)

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("userPIN");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const checkStoredPin = async () => {
      const storedPin = localStorage.getItem("userPIN");
      if (storedPin) {
        const response = await verifyPin(storedPin, user?.token);
        setPinVerified(response.success);
      }
      setChecking(false);
    };
    checkStoredPin();
  }, [user]);

  const verifyAndSavePin = async (pin) => {
    const response = await verifyPin(pin, user?.token);
    if (response.success) {
      localStorage.setItem("userPIN", pin);
      setPinVerified(true);
    }
    return response.success;
  };

  const value = {
    pinVerified,
    checking,
    verifyAndSavePin,
    setPinVerified,
    pinDisabled,
    setPinDisabled
  };

  return <PinContext.Provider value={value}>{children}</PinContext.Provider>;
}
