import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Table from "../../src/components/crud/Table.jsx";

const columns = [
  { key: "name", label: "Nombre", className: "name" },
  { key: "price", label: "Precio", className: "price" },
];

const items = [
  { code: "P1", name: "Producto A", price: 10 },
  { code: "P2", name: "Producto B", price: 20 },
];

describe("Table", () => {
  it("renders headers and rows", () => {
    render(
      <Table
        items={items}
        columns={columns}
        selectedItems={new Map()}
        setSelectedItems={vi.fn()}
      />
    );

    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Producto A")).toBeInTheDocument();
    expect(screen.getByText("Producto B")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <Table
        loading={true}
        items={[]}
        columns={columns}
      />
    );

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(
      <Table
        loading={false}
        items={[]}
        columns={columns}
      />
    );

    expect(screen.getByText("No hay datos para mostrar.")).toBeInTheDocument();
  });

  it("selects a row when clicked", () => {
    const setSelectedItems = vi.fn();

    render(
      <Table
        items={[items[0]]}
        columns={columns}
        selectedItems={new Map()}
        setSelectedItems={setSelectedItems}
      />
    );

    fireEvent.click(screen.getByText("Producto A"));

    const updatedMap = setSelectedItems.mock.calls[0][0];
    expect(updatedMap.has("P1")).toBe(true);
  });
});
