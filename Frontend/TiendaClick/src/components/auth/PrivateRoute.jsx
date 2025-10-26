import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import { usePin } from "../../context/PinContext.jsx";

export default function PrivateRoute({ children }) {
  const { user } = useUser();
  const { pinVerified, checking } = usePin();
  const location = useLocation();

  if (import.meta.env.VITE_DEBUG === "true") return children

  if (!user) return <Navigate to="/login/" replace />;

  if (checking) return null;

  const allowWithoutPin = ["/pin-manager"];

  if (!pinVerified && !allowWithoutPin.includes(location.pathname)) {
    return <Navigate to="/pin-manager/" replace />;
  }

  return children;
}