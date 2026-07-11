import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResetButton } from "../../components/timer/ResetButton";

describe("ResetButton", () => {
  // ==================== Happy Path ====================
  it("should render '重置' button label", () => {
    const onReset = vi.fn();
    render(<ResetButton onReset={onReset} />);
    expect(screen.getByText(/重置|Reset/i)).toBeInTheDocument();
  });

  it("should call onReset when clicked", () => {
    const onReset = vi.fn();
    render(<ResetButton onReset={onReset} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  // ==================== Edge Cases ====================
  it("should handle disabled state", () => {
    const onReset = vi.fn();
    render(<ResetButton onReset={onReset} disabled />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onReset).not.toHaveBeenCalled();
  });

  it("should handle undefined onReset gracefully", () => {
    render(<ResetButton onReset={undefined as any} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    fireEvent.click(button); // Should not throw
  });
});
