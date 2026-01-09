import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Item from "../../src/components/crud/Item.jsx";

const columns = [
    { key: "name", className: "name" },
    { key: "price", className: "price" },
    { key: "stock", className: "stock" },
];

describe("Item", () => {
    it("renders item values correctly", () => {
        const item = {
            code: "P1",
            name: "Producto A",
            price: 10,
            stock: 5,
        };

        render(
            <table>
                <tbody>
                    <Item item={item} columns={columns} />
                </tbody>
            </table>
        );

        expect(screen.getByText("Producto A")).toBeInTheDocument();
        expect(screen.getByText("10.00")).toBeInTheDocument();
        expect(screen.getByText("5.00")).toBeInTheDocument();
    });

    it("applies danger class when stock is 0", () => {
        const item = {
            code: "P2",
            name: "Sin stock",
            price: 20,
            stock: 0,
        };

        render(
            <table>
                <tbody>
                    <Item item={item} columns={columns} />
                </tbody>
            </table>
        );

        const stockCell = screen.getByText("0.00");
        expect(stockCell).toHaveClass("text-danger");
    });

    it("toggles selection on row click", () => {
        const item = {
            code: "P3",
            name: "Producto C",
            price: 15,
            stock: 2,
        };

        const selectedItems = new Map();
        const setSelectedItems = vi.fn();

        render(
            <table>
                <tbody>
                    <Item
                        item={item}
                        columns={columns}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                    />
                </tbody>
            </table>
        );

        const row = screen.getByText("Producto C").closest("tr");

        fireEvent.click(row);

        expect(setSelectedItems).toHaveBeenCalledWith(
            expect.any(Map)
        );

        const mapArg = setSelectedItems.mock.calls[0][0];
        expect(mapArg.has("P3")).toBe(true);
    });

    it("removes item from selection when clicking again", () => {
        const item = {
            code: "P4",
            name: "Producto D",
            price: 30,
            stock: 1,
        };

        const selectedItems = new Map([["P4", item]]);
        const setSelectedItems = vi.fn();

        render(
            <table>
                <tbody>
                    <Item
                        item={item}
                        columns={columns}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                    />
                </tbody>
            </table>
        );

        const row = screen.getByText("Producto D").closest("tr");
        expect(row).toHaveClass("selected-product");

        fireEvent.click(row);

        const mapArg = setSelectedItems.mock.calls[0][0];
        expect(mapArg.has("P4")).toBe(false);
    });

    it("uses custom pkName when provided", () => {
        const item = {
            id: 99,
            name: "Producto PK",
            price: 12,
            stock: 3,
        };

        const setSelectedItems = vi.fn();

        render(
            <table>
                <tbody>
                    <Item
                        item={item}
                        columns={columns}
                        pkName="id"
                        selectedItems={new Map()}
                        setSelectedItems={setSelectedItems}
                    />
                </tbody>
            </table>
        );

        fireEvent.click(screen.getByText("Producto PK").closest("tr"));

        const mapArg = setSelectedItems.mock.calls[0][0];
        expect(mapArg.has(99)).toBe(true);
    });
});
