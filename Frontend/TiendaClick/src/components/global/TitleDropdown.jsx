import React from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";

const options = [
  { label: "Inventario", path: "/inventory/" },
  { label: "Registro de cambios", path: "/product-blame/"},
  { label: "Ventas", path: "/sales/" },
  { label: "Dashboard", path: "/dashboard/" },
  { label: "Proveedores", path: "/providers/" },
  { label: "Ofertas", path: "/offers/" },
  { label: "Cerrar sesión", path: null },
];

export default function TitleDropdown({ currentTitle, setTitle }) {
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleSelect = (label, path) => {
    if (label === "Cerrar sesión") {
      logout();
      navigate("/login", { replace: true });
    } else {
      if (setTitle) setTitle(label);
      navigate(path);
    }
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="light"
        id="dropdown-title"
        className="fs-3 fw-bold border-0 bg-transparent text-dark"
      >
        {currentTitle.toUpperCase()}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {options.map((opt) => (
          <Dropdown.Item
            key={opt.label}
            onClick={() => handleSelect(opt.label, opt.path)}
            className={opt.label === "Cerrar sesión" ? "text-danger" : ""}
          >
            {opt.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}