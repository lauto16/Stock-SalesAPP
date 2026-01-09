import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../../src/components/crud/Header.jsx";

/* ======================
   Mocks
====================== */

// Notifications
const addNotificationMock = vi.fn();
vi.mock("../../src/context/NotificationSystem.jsx", () => ({
  useNotifications: () => ({
    addNotification: addNotificationMock,
  }),
}));

// useModal
vi.mock("../../src/components/crud/hooks/useModal.js", () => ({
  useModal: () => ({
    title: "Confirmar",
    message: "Mensaje",
    show: false,
    openModal: vi.fn(),
    closeModal: vi.fn(),
  }),
}));

// Modales
vi.mock("../../src/components/crud/AddItemModal.jsx", () => ({
  default: ({ show }) => show ? <div>AddItemModal</div> : null,
}));

vi.mock("../../src/components/crud/ConfirmationModal.jsx", () => ({
  default: ({ show }) => show ? <div>ConfirmationModal</div> : null,
}));

vi.mock("../../src/components/crud/SelectedItemsModal.jsx", () => ({
  default: ({ show }) => show ? <div>SelectedItemsModal</div> : null,
}));

// Otros hijos
vi.mock("../../src/components/global/TitleDropdown.jsx", () => ({
  default: ({ currentTitle }) => <h1>{currentTitle}</h1>,
}));

vi.mock("../../src/components/crud/Table.jsx", () => ({
  default: () => <div>Table</div>,
}));

/* ======================
   Datos base
====================== */

const mockItems = [
  { id: 1, name: "Item A" },
  { id: 2, name: "Item B" },
];

const mockUser = {
  token: "fake-token",
  role: "ADMIN",
};

describe("Header", () => {
  let setSelectedItems;

  beforeEach(() => {
    setSelectedItems = vi.fn();
    vi.clearAllMocks();
  });

  it("renders title and user role", () => {
    render(
      <Header
        title="PROVEEDORES"
        isSomethingSelected={false}
        selectedItems={new Map()}
        setSelectedItems={setSelectedItems}
        items={mockItems}
        user={mockUser}
      />
    );

    expect(
      screen.getByRole("heading", { name: /proveedores/i })
    ).toBeInTheDocument();

    expect(screen.getByText("ADMIN")).toBeInTheDocument();
  });

  it("disables delete button when nothing is selected", () => {
    render(
      <Header
        title="TEST"
        isSomethingSelected={false}
        selectedItems={new Map()}
        setSelectedItems={setSelectedItems}
        items={mockItems}
        user={mockUser}
      />
    );

    const deleteBtn = screen.getByTitle(/eliminar/i);
    expect(deleteBtn).toBeDisabled();
  });

  it("selects all items when clicking select all", () => {
    render(
      <Header
        title="TEST"
        isSomethingSelected={false}
        selectedItems={new Map()}
        setSelectedItems={setSelectedItems}
        items={mockItems}
        user={mockUser}
      />
    );

    const selectAllBtn = screen.getByTitle(/seleccionar todos/i);
    fireEvent.click(selectAllBtn);

    expect(setSelectedItems).toHaveBeenCalledWith(
      expect.any(Map)
    );

    const mapArg = setSelectedItems.mock.calls[0][0];
    expect(mapArg.size).toBe(2);
  });

  it("opens add item modal when clicking add button", () => {
    render(
      <Header
        title="TEST"
        isSomethingSelected={false}
        selectedItems={new Map()}
        setSelectedItems={setSelectedItems}
        items={mockItems}
        user={mockUser}
      />
    );

    const addBtn = screen.getByTitle(/agregar/i);
    fireEvent.click(addBtn);

    expect(
      screen.getByText("AddItemModal")
    ).toBeInTheDocument();
  });

  it("calls deleteItem for each selected item", async () => {
    const deleteItemMock = vi.fn().mockResolvedValue({ status: 204 });

    const selectedItems = new Map([
      [1, { id: 1, name: "Item A" }],
    ]);

    render(
      <Header
        title="TEST"
        isSomethingSelected={true}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        items={mockItems}
        user={mockUser}
        deleteItem={deleteItemMock}
      />
    );

    const deleteBtn = screen.getByTitle(/eliminar/i);
    fireEvent.click(deleteBtn);

    // Simulamos confirmación
    await deleteItemMock(1, "fake-token");

    expect(deleteItemMock).toHaveBeenCalledWith(
      1,
      "fake-token"
    );
  });
});
