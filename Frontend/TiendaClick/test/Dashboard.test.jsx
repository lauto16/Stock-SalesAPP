import { describe, it, expect, vi, } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Dashboard from "../src/components/dashboard/Dashboard.jsx";
import { mockUser } from "./mocks/useUser.mock.js";

// ✅ mock del hook REAL
vi.mock("../src/context/userContext.jsx", () => ({
    useUser: () => ({ user: mockUser }),
}));

// ✅ mock de permisos
vi.mock("../src/components/permissions_manager/PermissionVerifier.jsx", () => ({
    default: ({ children }) => children,
}));

// ✅ mock de guards
vi.mock("../src/components/auth/PrivateRoute.jsx", () => ({
    default: ({ children }) => children,
}));

vi.mock("../src/components/auth/AuthGuard.jsx", () => ({
    default: ({ children }) => children,
}));


// Layout (no nos interesa testearlos acá)
vi.mock("../src/components/sideNav/Nav.jsx", () => ({
    default: () => <nav data-testid="nav" />,
}));

vi.mock("../src/components/sideNav/SideBar.jsx", () => ({
    default: () => <aside data-testid="sidebar" />,
}));

// Componentes secundarios
vi.mock("../src/components/dashboard/ActionBox.jsx", () => ({
    default: ({ name, number }) => (
        <div>
            <span>{name}</span>
            <strong>{number}</strong>
        </div>
    ),
}));

vi.mock("../src/components/dashboard/DashboardHeader.jsx", () => ({
    default: ({ title }) => <h1>{title}</h1>,
}));

vi.mock("../src/components/notifications/Notifications.jsx", () => ({
    default: () => <div>Notifications</div>,
}));

vi.mock("../src/components/crud/Table.jsx", () => ({
    default: ({ items }) => (
        <table>
            <tbody>
                {items.map((item) => (
                    <tr key={item.code}>
                        <td>{item.name}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    ),
}));

/* =========================
   MOCK DE SERVICIOS AXIOS
========================= */

vi.mock("../src/services/axios.services.js", () => ({
    fetchLowStock: vi.fn(() =>
        Promise.resolve([
            { code: "P1", name: "Producto bajo stock", stock: 2 },
        ])
    ),
    fetchSalesStats: vi.fn(() =>
        Promise.resolve({
            sales_data: {
                total_sales_this_day: 3,
                total_money_sales_this_day: 1500,
                total_sales_this_month: 20,
                total_money_sales_this_month: 8000,
                total_sales_this_year: 200,
                total_money_sales_this_year: 90000,
            },
        })
    ),
    fetchEmployeesStats: vi.fn(() =>
        Promise.resolve({
            employees_stats: {
                most_selling_employee_this_day: "Juan",
            },
        })
    ),
    fetchProductsStats: vi.fn(() =>
        Promise.resolve({
            products_data: {
                average_gain_margin_per_product: 25,
            },
        })
    ),
}));

describe("Dashboard", () => {
    it("should render the dashboard", () => {
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Dashboard />
            </MemoryRouter>
        );

        expect(
            screen.getByText(/dashboard/i)
        ).toBeInTheDocument();
    });

});
describe("Dashboard – test integral", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renderiza el dashboard con datos y tabla", async () => {
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Dashboard />
            </MemoryRouter>
        );

        // Header
        expect(
            screen.getByRole("heading", { name: /dashboard/i })
        ).toBeInTheDocument();

        // Action boxes
        expect(screen.getByText("Ventas hoy")).toBeInTheDocument();
        // expect(screen.getByText("3")).toBeInTheDocument();

        expect(
            screen.getByText("Margen de ganancia promedio")
        ).toBeInTheDocument();
        // expect(screen.getByText("25%")).toBeInTheDocument();

        // Tabla (espera async)
        await waitFor(() => {
            expect(
                screen.getByText("Producto bajo stock")
            ).toBeInTheDocument();
        });

        // Notifications
        expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    it("permite cambiar el valor de stock mínimo y vuelve a cargar", async () => {
        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        const input = screen.getByRole("spinbutton");
        const button = screen.getByRole("button");

        fireEvent.change(input, { target: { value: "10" } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(
                screen.getByText("Producto bajo stock")
            ).toBeInTheDocument();
        });
    });
});