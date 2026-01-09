import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddItemContent from "../../src/components/providers/forms/AddItemContent.jsx";

const registerMock = vi.fn(() => ({
    name: "test",
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
}));

describe("AddItemContent", () => {
    it("renders all inputs", () => {
        render(
            <AddItemContent
                register={registerMock}
                errors={{}}
            />
        );

        expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
        expect(screen.getByLabelText("Teléfono")).toBeInTheDocument();
        expect(screen.getByLabelText("Dirección")).toBeInTheDocument();
        expect(screen.getByLabelText("Correo")).toBeInTheDocument();
    });

    it("shows validation errors", () => {
        render(
            <AddItemContent
                register={registerMock}
                errors={{
                    name: { message: "Error nombre" },
                    phone: { message: "Error teléfono" },
                }}
            />
        );

        expect(screen.getByText("Error nombre")).toBeInTheDocument();
        expect(screen.getByText("Error teléfono")).toBeInTheDocument();
    });
});
