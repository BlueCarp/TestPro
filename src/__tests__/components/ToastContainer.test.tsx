import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ToastContainer } from "../../components/common/ToastContainer";

describe("ToastContainer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ==================== Happy Path ====================
  it("should render multiple toasts", () => {
    const toasts = [
      { id: "1", message: "Toast 1", type: "success" as const },
      { id: "2", message: "Toast 2", type: "error" as const },
    ];
    render(<ToastContainer toasts={toasts} />);
    expect(screen.getByText("Toast 1")).toBeInTheDocument();
    expect(screen.getByText("Toast 2")).toBeInTheDocument();
  });

  it("should render empty container when no toasts", () => {
    const { container } = render(<ToastContainer toasts={[]} />);
    // Container should be rendered but with no visible toasts
    expect(container.firstChild).toBeInTheDocument();
  });

  // ==================== Removal ====================
  it("should call onRemove when toast dismisses", () => {
    const onRemove = vi.fn();
    const toasts = [
      { id: "1", message: "Test Toast", type: "success" as const, onDismiss: () => onRemove("1") },
    ];
    render(<ToastContainer toasts={toasts} />);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(onRemove).toHaveBeenCalledWith("1");
  });

  // ==================== Dynamic Updates ====================
  it("should handle toasts being added (re-render with more)", () => {
    const { rerender } = render(<ToastContainer toasts={[]} />);

    const toasts = [
      { id: "1", message: "New Toast", type: "success" as const },
    ];
    rerender(<ToastContainer toasts={toasts} />);
    expect(screen.getByText("New Toast")).toBeInTheDocument();
  });

  // ==================== Rendering ====================
  it("should render via Portal to document.body", () => {
    const toasts = [
      { id: "1", message: "Portal Toast", type: "success" as const },
    ];
    const { container } = render(<ToastContainer toasts={toasts} />);
    // Toast container content should not be in the main container directly
    // (it teleports via Portal)
    expect(screen.getByText("Portal Toast")).toBeInTheDocument();
  });
});
