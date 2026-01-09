import { describe, it, expect } from "vitest";
import { prettyDOM, render, screen } from "@testing-library/react";
import InfoFormContent from "../../src/components/providers/forms/InfoFormContent.jsx";

// mock simple de register (react-hook-form)
const mockRegister = (name) => ({
  name,
  onChange: () => { },
  onBlur: () => { },
  ref: () => { },
});

describe("InfoFormContent", () => {
  const selectedItem = {
    id: 10,
    name: "Proveedor Test",
    phone: "123456789",
    address: "Calle Falsa 123",
    email: "test@mail.com",
  };

  it("renderiza los campos con valores precargados", () => {
    const form = render(
      <InfoFormContent
        register={mockRegister}
        selectedItem={selectedItem}
        errors={{}}
      />
    );

    // Labels
    console.log(prettyDOM(form.container));
    expect(screen.getByLabelText("Nombre")).toHaveValue("Proveedor Test");
    expect(screen.getByLabelText("Teléfono")).toHaveValue("123456789");
    expect(screen.getByLabelText("Dirección")).toHaveValue("Calle Falsa 123");
    expect(screen.getByLabelText("Correo")).toHaveValue("test@mail.com");
  });

  it("muestra mensajes de error cuando existen", () => {
    render(
      <InfoFormContent
        register={mockRegister}
        selectedItem={selectedItem}
        errors={{
          name: { message: "Nombre obligatorio" },
          phone: { message: "Teléfono inválido" },
        }}
      />
    );

    expect(screen.getByText("Nombre obligatorio")).toBeInTheDocument();
    expect(screen.getByText("Teléfono inválido")).toBeInTheDocument();
  });

  it("incluye el input oculto con el id", () => {
    render(
      <InfoFormContent
        register={mockRegister}
        selectedItem={selectedItem}
        errors={{}}
      />
    );

    const hiddenInput = screen.getByDisplayValue("10");
    expect(hiddenInput).toBeInTheDocument();
  });
});
