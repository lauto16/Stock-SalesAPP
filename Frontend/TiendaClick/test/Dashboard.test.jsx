import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
