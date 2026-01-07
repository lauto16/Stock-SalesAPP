import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useState } from "react";
import "@testing-library/jest-dom";

const SimpleComponent = () => {
    const [count] = useState(0);
    return <div>Count: {count}</div>;
};

describe("Simple Test", () => {
    it("renders with hooks", () => {
        render(<SimpleComponent />);
        expect(screen.getByText("Count: 0")).toBeInTheDocument();
    });
});
