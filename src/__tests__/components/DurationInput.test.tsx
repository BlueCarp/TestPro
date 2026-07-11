import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DurationInput } from "../../components/settings/DurationInput";

describe("DurationInput", () => {
  const defaultProps = {
    label: "工作时间",
    value: 25,
    min: 1,
    max: 120,
    onChange: vi.fn(),
  };

  // ==================== Happy Path ====================
  it("should render the label", () => {
    render(<DurationInput {...defaultProps} />);
    expect(screen.getByText("工作时间")).toBeInTheDocument();
  });

  it("should display the current value", () => {
    render(<DurationInput {...defaultProps} value={30} />);
    expect(screen.getByDisplayValue("30")).toBeInTheDocument();
  });

  it("should call onChange with value+1 when [+] is clicked", () => {
    const onChange = vi.fn();
    render(<DurationInput {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText("+"));
    expect(onChange).toHaveBeenCalledWith(26);
  });

  it("should call onChange with value-1 when [-] is clicked", () => {
    const onChange = vi.fn();
    render(<DurationInput {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText("-"));
    expect(onChange).toHaveBeenCalledWith(24);
  });

  // ==================== Boundary Behavior ====================
  it("should not decrement below min", () => {
    const onChange = vi.fn();
    render(<DurationInput {...defaultProps} value={1} min={1} onChange={onChange} />);
    const minusButton = screen.getByText("-");
    expect(minusButton).toBeDisabled();
    fireEvent.click(minusButton);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("should not increment above max", () => {
    const onChange = vi.fn();
    render(<DurationInput {...defaultProps} value={120} max={120} onChange={onChange} />);
    const plusButton = screen.getByText("+");
    expect(plusButton).toBeDisabled();
    fireEvent.click(plusButton);
    expect(onChange).not.toHaveBeenCalled();
  });

  // ==================== Direct Input ====================
  it("should call onChange when user types a number", () => {
    const onChange = vi.fn();
    render(<DurationInput {...defaultProps} onChange={onChange} />);
    const input = screen.getByRole("spinbutton") || screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "30" } });
    expect(onChange).toHaveBeenCalledWith(30);
  });

  it("should call onChange when user clears and types new value", () => {
    const onChange = vi.fn();
    render(<DurationInput {...defaultProps} onChange={onChange} />);
    const input = screen.getByRole("spinbutton") || screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "45" } });
    expect(onChange).toHaveBeenCalledWith(45);
  });

  // ==================== Accessibility ====================
  it("should have accessible +/- buttons", () => {
    render(<DurationInput {...defaultProps} />);
    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("should handle label-only mode without suffix", () => {
    render(<DurationInput {...defaultProps} />);
    expect(screen.getByText("工作时间")).toBeInTheDocument();
  });
});
