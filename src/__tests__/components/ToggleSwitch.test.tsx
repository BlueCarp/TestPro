import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToggleSwitch } from "../../components/settings/ToggleSwitch";

describe("ToggleSwitch", () => {
  // ==================== Happy Path ====================
  it("should render the label", () => {
    const onToggle = vi.fn();
    render(<ToggleSwitch label="声音通知" enabled={true} onToggle={onToggle} />);
    expect(screen.getByText("声音通知")).toBeInTheDocument();
  });

  it("should show enabled state when enabled=true", () => {
    const onToggle = vi.fn();
    render(<ToggleSwitch label="声音通知" enabled={true} onToggle={onToggle} />);
    const toggle = screen.getByRole("switch");
    // aria-checked reflects the toggle state
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("should show disabled state when enabled=false", () => {
    const onToggle = vi.fn();
    render(<ToggleSwitch label="声音通知" enabled={false} onToggle={onToggle} />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("should call onToggle when clicked", () => {
    const onToggle = vi.fn();
    render(<ToggleSwitch label="声音通知" enabled={true} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  // ==================== Interaction ====================
  it("should toggle on click", () => {
    const onToggle = vi.fn();
    render(<ToggleSwitch label="声音通知" enabled={true} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalled();
  });

  it("should handle multiple clicks", () => {
    const onToggle = vi.fn();
    render(<ToggleSwitch label="声音通知" enabled={true} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledTimes(3);
  });

  // ==================== Accessibility ====================
  it("should have role='switch'", () => {
    const onToggle = vi.fn();
    render(<ToggleSwitch label="声音通知" enabled={true} onToggle={onToggle} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("should support keyboard activation with Enter", () => {
    const onToggle = vi.fn();
    render(<ToggleSwitch label="声音通知" enabled={true} onToggle={onToggle} />);
    const toggle = screen.getByRole("switch");
    fireEvent.keyDown(toggle, { key: "Enter" });
    expect(onToggle).toHaveBeenCalled();
  });

  it("should support keyboard activation with Space", () => {
    const onToggle = vi.fn();
    render(<ToggleSwitch label="声音通知" enabled={true} onToggle={onToggle} />);
    const toggle = screen.getByRole("switch");
    fireEvent.keyDown(toggle, { key: " " });
    expect(onToggle).toHaveBeenCalled();
  });
});
