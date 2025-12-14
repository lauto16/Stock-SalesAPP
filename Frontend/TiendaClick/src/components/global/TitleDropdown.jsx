import React from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import { FaLock } from "react-icons/fa";

const options_other = [
  { label: "Inventario", path: "/inventory/", permission: "access_inventory" },
  { label: "Registro de cambios", path: "/product-blame/", permission: "access_blame" },
  { label: "Ventas", path: "/sales/", permission: "access_sales" },
  { label: "Dashboard", path: "/dashboard/", permission: "access_dashboard" },
  { label: "Proveedores", path: "/providers/", permission: "access_providers" },
  { label: "Ofertas", path: "/offers/", permission: "access_offers" },
  { label: "Cerrar sesión", path: "/login/" },
  { label: "Categorias", path: "/categories/", permission: "access_inventory" }
];

const options_dashboard = [
  ...options_other.filter(opt => opt.label !== "Cerrar sesión"),
  { label: "Crear nuevo usuario", path: "/sign-up/", permission: null },
  { label: "Eliminar usuario", path: "/delete-user/", permission: null },
  options_other.find(opt => opt.label === "Cerrar sesión")
];

export default function TitleDropdown({ currentTitle, setTitle, isDashboard }) {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const options = isDashboard ? options_dashboard : options_other;

  const logoutOption = options.find(opt => opt.label === "Cerrar sesión");
  const otherOptions = options.filter(opt => opt.label !== "Cerrar sesión");

  const sortedOptions = [...otherOptions].sort((a, b) => {
    const aDisabled = a.permission && !user?.permissions?.includes(a.permission);
    const bDisabled = b.permission && !user?.permissions?.includes(b.permission);
    return aDisabled === bDisabled ? 0 : aDisabled ? -1 : 1;
  });

  if (logoutOption) sortedOptions.push(logoutOption);

  const handleSelect = (label, path, disabled) => {
    if (disabled) return;
    if (label === "Cerrar sesión") {
      logout();
      navigate("/login", { replace: true });
    } else {
      if (setTitle) setTitle(label);
      navigate(path);
    }
  };

  return (
    <Dropdown style={{ display: "inline-block", width: "auto" }}>
      <Dropdown.Toggle
        variant="light"
        id="dropdown-title"
        className="fw-bold border-0 bg-transparent text-dark"
      >
        {currentTitle.toUpperCase()}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {sortedOptions.map((opt) => {
          const disabled =
            opt.permission && !user?.permissions?.includes(opt.permission);
          return (
            <Dropdown.Item
              key={opt.label}
              onClick={() => handleSelect(opt.label, opt.path, disabled)}
              className={`${disabled ? "text-secondary" : ""} ${opt.label === "Cerrar sesión" ? "text-danger" : ""
                }`}
              style={{ color: disabled ? "#6c757d" : undefined, backgroundColor: disabled ? "#d9d9d9" : undefined }}
              disabled={disabled}
            >
              {opt.label} {disabled && <FaLock className="ms-2" />}
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}
