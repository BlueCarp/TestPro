import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PrimaryButton } from "../../components/timer/PrimaryButton";

describe("PrimaryButton", () => {
  // ==================== Happy Path ====================
  it("should render '开始' when status is idle", () => {
    const onClick = vi.fn();
    render(<PrimaryButton status="idle" onClick={onClick} />);
    expect(screen.getByText("开始")).toBeInTheDocument();
  });

  it("should render '暂停' when status is running", () => {
    const onClick = vi.fn();
    render(<PrimaryButton status="running" onClick={onClick} />);
    expect(screen.getByText("暂停")).toBeInTheDocument();
  });

  it("should render '继续' when status is paused", () => {
    const onClick = vi.fn();
    render(<PrimaryButton status="paused" onClick={onClick} />);
    expect(screen.getByText("继续")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const onClick = vi.fn();
    render(<PrimaryButton status="idle" onClick={onClick} />);
    fireEvent.click(screen.getByText("开始"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // ==================== Interaction Tests ====================
  it("should not be disabled by default", () => {
    const onClick = vi.fn();
    render(<PrimaryButton status="idle" onClick={onClick} />);
    expect(screen.getByText("开始")).not.toBeDisabled();
  });

  it("should handle multiple clicks", () => {
    const onClick = vi.fn();
    render(<PrimaryButton status="running" onClick={onClick} />);
    fireEvent.click(screen.getByText("暂停"));
    fireEvent.click(screen.getByText("暂停"));
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  // ==================== Edge Cases ====================
  it("should handle undefined onClick gracefully", () => {
    render(<PrimaryButton status="idle" onClick={undefined as any} />);
    const button = screen.getByText("开始");
    expect(button).toBeInTheDocument();
    // Should not throw when clicked
    fireEvent.click(button);
  });

  // ==================== Accessibility ====================
  it("should have accessible button role", () => {
    const onClick = vi.fn();
    render(<PrimaryButton status="idle" onClick={onClick} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should respond to keyboard Enter key", () => {
    const onClick = vi.fn();
    render(<PrimaryButton status="idle" onClick={onClick} />);
    const button = screen.getByText("开始");
    fireEvent.keyDown(button, { key: "Enter" });
    expect(onClick).toHaveBeenCalled();
  });

  it("should respond to keyboard Space key", () => {
    const onClick = vi.fn();
    render(<PrimaryButton status="idle" onClick={onClick} />);
    const button = screen.getByText("开始");
    fireEvent.keyDown(button, { key: " " });
    expect(onClick).toHaveBeenCalled();
  });
});
