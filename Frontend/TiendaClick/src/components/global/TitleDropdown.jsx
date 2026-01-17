import React from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import {
  FaBox,
  FaHistory,
  FaShoppingCart,
  FaChartBar,
  FaTags,
  FaList,
  FaChartLine,
  FaTruck,
  FaCog,
  FaSignOutAlt,
  FaTruckLoading,
  FaUserPlus,
  FaUserMinus,
  FaLock
} from "react-icons/fa";

const options_other = [
  { label: "Inventario", path: "/inventory/", permission: "access_inventory", icon: <FaBox /> },
  { label: "Registro de cambios", path: "/product-blame/", permission: "access_blame", icon: <FaHistory /> },
  { label: "Ventas", path: "/sales/", permission: "access_sales", icon: <FaShoppingCart /> },
  { label: "Dashboard", path: "/dashboard/", permission: "access_dashboard", icon: <FaChartBar /> },
  { label: "Ofertas", path: "/offers/", permission: "access_offers", icon: <FaTags /> },
  { label: "Categorias", path: "/categories/", permission: "access_inventory", icon: <FaList /> },
  { label: "Estadisticas", path: "/stats/", permission: "access_dashboard", icon: <FaChartLine /> },
  { label: "Proveedores", path: "/providers/", permission: "access_providers", icon: <FaTruck /> },
  { label: "Configuración", path: "/config-app/", permission: "access_dashboard", icon: <FaCog /> },
  { label: "Cerrar sesión", path: "/login/", icon: <FaSignOutAlt /> },
  { label: "Ingresos", path: "/entries/", icon: <FaTruckLoading /> },
];

const options_dashboard = [
  ...options_other.filter(opt => opt.label !== "Cerrar sesión"),
  { label: "Crear nuevo usuario", path: "/sign-up/", permission: null, icon: <FaUserPlus /> },
  { label: "Eliminar usuario", path: "/delete-user/", permission: null, icon: <FaUserMinus /> },
  options_other.find(opt => opt.label === "Cerrar sesión"),
];

export default function TitleDropdown({ currentTitle, setTitle, isDashboard }) {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const options = isDashboard ? options_dashboard : options_other;

  const logoutOption = options.find(opt => opt.label === "Cerrar sesión");
  const otherOptions = options.filter(opt => opt.label !== "Cerrar sesión");

  const sortedOptions = [...otherOptions].sort((a, b) => {
    const lengthDiff = b.label.length - a.label.length;
    if (lengthDiff !== 0) return lengthDiff;

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
              className={`d-flex align-items-center justify-content-between
    ${disabled ? "text-secondary" : ""}
    ${opt.label === "Cerrar sesión" ? "text-danger" : ""}`}
              style={{
                color: disabled ? "#6c757d" : undefined,
                backgroundColor: disabled ? "#d9d9d9" : undefined
              }}
              disabled={disabled}
            >
              <span className="d-flex align-items-center gap-2">
                {opt.icon}
                {opt.label}
              </span>

              {disabled && <FaLock />}
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}
