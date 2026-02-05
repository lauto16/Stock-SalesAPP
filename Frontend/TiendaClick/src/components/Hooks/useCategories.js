import { useEffect, useState } from "react";
import { fetchCategories } from "../../services/axios.services.categories";

export function useCategories(token) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories(setLoading, token)
      .then((data) => setCategories(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return {
    categories,
    setCategories,
    error,
    loading
  };
}