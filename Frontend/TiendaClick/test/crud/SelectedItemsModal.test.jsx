import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SelectedItemsModal from "../../src/components/crud/SelectedItemsModal.jsx";

const columns = [
    { key: "name", label: "Nombre", className: "name" },
    { key: "price", label: "Precio", className: "price" },
];

describe("SelectedItemsModal", () => {
    it("renders selected items when show is true", () => {
        const selectedItems = new Map([
            [
                "P1",
                { code: "P1", name: "Producto A", price: 10 },
            ],
        ]);

        render(
            <SelectedItemsModal
                show={true}
                handleClose={vi.fn()}
                selectedItems={selectedItems}
                setSelectedItems={vi.fn()}
                columns={columns}
            />
        );
        expect(screen.getByText("Items seleccionados")).toBeInTheDocument();
        expect(screen.getByText("Producto A")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("removes item when clicking deselect button", () => {
        const item = { code: "P2", name: "Producto B", price: 20 };
        const selectedItems = new Map([["P2", item]]);
        const setSelectedItems = vi.fn();

        render(
            <SelectedItemsModal
                show={true}
                handleClose={vi.fn()}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                columns={columns}
            />
        );

        const removeBtn = screen.getByTitle("Deseleccionar");
        fireEvent.click(removeBtn);

        const mapArg = setSelectedItems.mock.calls[0][0];
        expect(mapArg.has("P2")).toBe(false);
    });

    it("calls handleClose when clicking Cerrar", () => {
        const handleClose = vi.fn();

        render(
            <SelectedItemsModal
                show={true}
                handleClose={handleClose}
                selectedItems={new Map()}
                setSelectedItems={vi.fn()}
                columns={columns}
            />
        );

        fireEvent.click(screen.getByText("Cerrar"));
        expect(handleClose).toHaveBeenCalled();
    });

    it("does not render when show is false", () => {
        render(
            <SelectedItemsModal
                show={false}
                handleClose={vi.fn()}
                selectedItems={new Map()}
                setSelectedItems={vi.fn()}
                columns={columns}
            />
        );

        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
});
