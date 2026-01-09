import { describe, it, expect, vi, beforeEach, } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Providers from "../../src/components/providers/Providers.jsx";

// =======================
// Mocks
// =======================

// Usuario
vi.mock("../../src/context/UserContext.jsx", () => ({
    useUser: () => ({
        user: { token: "fake-token" },
    }),
}));

// Permisos
vi.mock("../../src/components/permissions_manager/PermissionVerifier.jsx", () => ({
    default: ({ children }) => <>{children}</>,
}));

// Servicios axios
const fetchProvidersMock = vi.fn();

vi.mock("../../src/services/axios.services.js", () => ({
    fetchProviders_by_page: (...args) => fetchProvidersMock(...args),
    deleteProviderById: vi.fn(),
    addProvider: vi.fn(),
    updateProvider: vi.fn(),
}));

// Componentes hijos (mock simples)
vi.mock("../../src/components/crud/Header.jsx", () => ({
    default: ({ title }) => <h1>{title}</h1>,
}));

vi.mock("../../src/components/inventory/Pagination.jsx", () => ({
    default: () => <div>Pagination</div>,
}));

vi.mock("../../src/components/crud/Table.jsx", () => ({
    default: ({ items, loading }) => (
        <div>
            {loading && <span>Loading...</span>}
            {!loading &&
                items.map((item) => (
                    <div key={item.id}>{item.name}</div>
                ))}
        </div>
    ),
}));

// =======================
// Tests
// =======================

describe("Providers", () => {
    beforeEach(() => {
        fetchProvidersMock.mockResolvedValue({
            count: 2,
            results: [
                {
                    id: 1,
                    name: "Proveedor A",
                    phone: "123456",
                    email: "a@mail.com",
                    address: "Calle 1",
                },
                {
                    id: 2,
                    name: "Proveedor B",
                    phone: "654321",
                    email: "b@mail.com",
                    address: "Calle 2",
                },
                {
                    id: 3,
                    name: "Proveedor C",
                    phone: "123456",
                    email: "c@mail.com",
                    address: "Calle 3",
                },
                {
                    id: 4,
                    name: "Proveedor D",
                    phone: "654321",
                    email: "d@mail.com",
                    address: "Calle 4",
                },
                {
                    id: 5,
                    name: "Proveedor E",
                    phone: "123456",
                    email: "e@mail.com",
                    address: "Calle 5",
                },
                {
                    id: 6,
                    name: "Proveedor F",
                    phone: "654321",
                    email: "f@mail.com",
                    address: "Calle 6",
                },
                {
                    id: 7,
                    name: "Proveedor G",
                    phone: "123456",
                    email: "g@mail.com",
                    address: "Calle 7",
                },
                {
                    id: 8,
                    name: "Proveedor H",
                    phone: "654321",
                    email: "h@mail.com",
                    address: "Calle 8",
                },
                {
                    id: 9,
                    name: "Proveedor I",
                    phone: "123456",
                    email: "i@mail.com",
                    address: "Calle 9",
                },
                {
                    id: 10,
                    name: "Proveedor J",
                    phone: "654321",
                    email: "j@mail.com",
                    address: "Calle 10",
                }
            ],
        });
    });

    it("should show loading state and after show the providers list", async () => {
        render(<Providers />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();

        // Header
        expect(
            screen.getByRole("heading", { name: /proveedores/i })
        ).toBeInTheDocument();

        // Se llamó al fetch
        expect(fetchProvidersMock).toHaveBeenCalledWith({
            page: 1,
            setLoading: expect.any(Function),
            token: "fake-token",
        });

        // Esperamos a que aparezcan los proveedores
        expect(
            await screen.findByText("Proveedor A")
        ).toBeInTheDocument();

        expect(
            await screen.findByText("Proveedor B")
        ).toBeInTheDocument();

        // Pagination mock
        expect(screen.getByText("Pagination")).toBeInTheDocument();
    });
});
