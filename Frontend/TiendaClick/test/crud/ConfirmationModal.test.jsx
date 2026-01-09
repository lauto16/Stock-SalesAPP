import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmationModal from "../../src/components/crud/ConfirmationModal.jsx";

describe("ConfirmationModal", () => {
  it("renders title and message when show is true", () => {
    render(
      <ConfirmationModal
        show={true}
        title="Confirmar acción"
        message="¿Estás seguro?"
        handleClose={vi.fn()}
        onSendForm={vi.fn()}
      />
    );

    expect(
      screen.getByText("Confirmar acción")
    ).toBeInTheDocument();

    expect(
      screen.getByText("¿Estás seguro?")
    ).toBeInTheDocument();
  });

  it("renders JSX message correctly", () => {
    render(
      <ConfirmationModal
        show={true}
        title="Confirmar"
        message={<span>Mensaje JSX</span>}
        handleClose={vi.fn()}
        onSendForm={vi.fn()}
      />
    );

    expect(
      screen.getByText("Mensaje JSX")
    ).toBeInTheDocument();
  });

  it("calls handleClose when clicking Cancelar", () => {
    const handleClose = vi.fn();

    render(
      <ConfirmationModal
        show={true}
        title="Confirmar"
        message="Mensaje"
        handleClose={handleClose}
        onSendForm={vi.fn()}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /cancelar/i })
    );

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onSendForm when clicking Aceptar", () => {
    const onSendForm = vi.fn();

    render(
      <ConfirmationModal
        show={true}
        title="Confirmar"
        message="Mensaje"
        handleClose={vi.fn()}
        onSendForm={onSendForm}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /aceptar/i })
    );

    expect(onSendForm).toHaveBeenCalledTimes(1);
  });

  it("disables Aceptar button when isSending is true", () => {
    render(
      <ConfirmationModal
        show={true}
        title="Confirmar"
        message="Mensaje"
        handleClose={vi.fn()}
        onSendForm={vi.fn()}
        isSending={true}
      />
    );

    expect(
      screen.getByRole("button", { name: /aceptar/i })
    ).toBeDisabled();
  });

  it("does not render content when show is false", () => {
    render(
      <ConfirmationModal
        show={false}
        title="Confirmar"
        message="Mensaje"
        handleClose={vi.fn()}
        onSendForm={vi.fn()}
      />
    );

    expect(
      screen.queryByText("Confirmar")
    ).not.toBeInTheDocument();
  });
});
