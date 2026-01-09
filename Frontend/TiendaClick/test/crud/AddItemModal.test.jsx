import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AddItemModal from "../../src/components/crud/AddItemModal.jsx";

/* ============================
   MOCK useAddItemForm
============================ */

const handleSubmitMock = vi.fn((fn) => (e) => {
    e.preventDefault();
    fn();
});

const onSubmitMock = vi.fn();
const resetMock = vi.fn();

vi.mock("../../src/components/crud/hooks/useAddItemForm.js", () => ({
    useAddItemForm: () => ({
        register: vi.fn(),
        handleSubmit: handleSubmitMock,
        watch: vi.fn(),
        onSubmit: onSubmitMock,
        errors: {},
        reset: resetMock,
        control: {},
    }),
}));

/* ============================
   MOCK Content
============================ */

const MockContent = ({ selectedItem }) => (
    <div>
        <span>Mock Content</span>
        {selectedItem?.name && <span>{selectedItem.name}</span>}
    </div>
);

/* ============================
   TESTS
============================ */

describe("AddItemModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders modal with title and content", () => {
        render(
            <AddItemModal
                show={true}
                handleClose={vi.fn()}
                title="Agregar proveedor"
                Content={MockContent}
            />
        );

        expect(
            screen.getByText("Agregar proveedor")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Mock Content")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /agregar/i })
        ).toBeInTheDocument();
    });

    it("calls onSubmit when submitting the form", () => {
        render(
            <AddItemModal
                show={true}
                handleClose={vi.fn()}
                title="Agregar proveedor"
                Content={MockContent}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: /agregar/i })
        );

        expect(onSubmitMock).toHaveBeenCalled();
    });

    it("loads selected item into the form when selectedItems changes", () => {
        const selectedItems = new Map([
            [1, { id: 1, name: "Proveedor A" }],
        ]);

        render(
            <AddItemModal
                show={true}
                handleClose={vi.fn()}
                title="Editar proveedor"
                Content={MockContent}
                selectedItems={selectedItems}
            />
        );

        expect(screen.getByText("Proveedor A")).toBeInTheDocument();
        expect(resetMock).toHaveBeenCalledWith({
            id: 1,
            name: "Proveedor A",
        });
    });
});
