import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CustomInput from "../../src/components/crud/CustomInput.jsx";

describe("CustomInput", () => {
  const mockRegister = {
    name: "test",
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
  };

  it("renders label correctly", () => {
    render(
      <CustomInput
        label="Nombre"
        type="text"
        register={mockRegister}
      />
    );

    expect(
      screen.getByText("Nombre")
    ).toBeInTheDocument();
  });

  it("renders icon when icon prop is provided", () => {
    render(
      <CustomInput
        label="Email"
        icon="bi bi-envelope"
        type="email"
        register={mockRegister}
      />
    );

    const icon = document.querySelector(".bi-envelope");
    expect(icon).toBeInTheDocument();
  });

  it("renders input with correct type", () => {
    render(
      <CustomInput
        label="Cantidad"
        type="number"
        register={mockRegister}
      />
    );

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("type", "number");
  });

  it("uses defaultValue when provided", () => {
    render(
      <CustomInput
        label="Precio"
        type="number"
        defaultValue={10}
        register={mockRegister}
      />
    );

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(10);
  });

  it("disables input when disabled is true", () => {
    render(
      <CustomInput
        label="Stock"
        type="number"
        disabled={true}
        register={mockRegister}
      />
    );

    const input = screen.getByRole("spinbutton");
    expect(input).toBeDisabled();
  });

  it("calls register.onChange when typing", () => {
    render(
      <CustomInput
        label="Nombre"
        type="text"
        register={mockRegister}
      />
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Producto A" } });

    expect(mockRegister.onChange).toHaveBeenCalled();
  });

  it("applies custom inline styles", () => {
    render(
      <CustomInput
        label="Custom"
        type="text"
        inputStyle={{ textAlign: "center" }}
        register={mockRegister}
      />
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveStyle({ textAlign: "center" });
  });
});
