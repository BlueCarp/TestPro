import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SkipButton } from "../../components/timer/SkipButton";

describe("SkipButton", () => {
  // ==================== Happy Path ====================
  it("should render '跳过' button label", () => {
    const onSkip = vi.fn();
    render(<SkipButton onSkip={onSkip} />);
    expect(screen.getByText(/跳过|Skip/i)).toBeInTheDocument();
  });

  it("should call onSkip when clicked", () => {
    const onSkip = vi.fn();
    render(<SkipButton onSkip={onSkip} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  // ==================== Edge Cases ====================
  it("should handle disabled state", () => {
    const onSkip = vi.fn();
    render(<SkipButton onSkip={onSkip} disabled />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onSkip).not.toHaveBeenCalled();
  });

  it("should be enabled by default", () => {
    const onSkip = vi.fn();
    render(<SkipButton onSkip={onSkip} />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("should handle undefined onSkip gracefully", () => {
    render(<SkipButton onSkip={undefined as any} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    fireEvent.click(button); // Should not throw
  });
});
