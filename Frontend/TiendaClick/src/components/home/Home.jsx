import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext.jsx'

export default function Home() {
  const { user } = useUser()
  const navigate = useNavigate()
  const getRedirectPathByRole = (role) => {
    switch (role) {
      case "Repositor":
        return "/inventory";
      case "Administrador":
        return "/dashboard";
      case "Vendedor":
        return "/sales";
      case "Vendedor y Repositor":
        return "/sales"
      default:
        return "/";
    }
  };

  useEffect(() => {
    navigate(getRedirectPathByRole(user?.role))
  }, [])
  return (
    <div className="container py-5">
      <h1 className="mb-4">Bienvenido a la Home</h1>
      <p className="lead">Esta es la página principal de tu negocio.</p>

      <div className="mt-4">
        <Link to="/dashboard" className="btn btn-primary">
          Ir al Dashboard
        </Link>
      </div>
    </div>
  )
}

