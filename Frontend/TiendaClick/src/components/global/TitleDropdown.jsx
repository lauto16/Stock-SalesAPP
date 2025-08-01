import React from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const options = [
  { label: "Inventario", path: "/inventory/" },
  { label: "Ventas", path: "/sales/" },
  { label: "Dashboard", path: "/dashboard/" },
  { label: "Proveedores", path: "/providers/" },
  { label: "Ofertas", path: "/offers/" },
];

export default function TitleDropdown({ currentTitle, setTitle }) {
  const navigate = useNavigate();

  const handleSelect = (label, path) => {
    if (setTitle) setTitle(label);
    navigate(path);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="light"
        id="dropdown-title"
        className="fs-3 fw-bold border-0 bg-transparent text-dark"
      >
        {currentTitle}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {options.map((opt) => (
          <Dropdown.Item
            key={opt.path}
            onClick={() => handleSelect(opt.label, opt.path)}
          >
            {opt.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
