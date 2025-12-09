import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function AuthGuard({ children }) {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let storedUser = user;

    if (!storedUser) {
      const local = localStorage.getItem("user");
      if (local) {
        try {
          storedUser = JSON.parse(local);
          setUser(storedUser);
        } catch {
          storedUser = null;
        }
      }
    }

    if (!storedUser) {
      navigate("/login", { replace: true });
    }

    setLoading(false);
  }, []);

  if (loading) return null;

  return children;
}