import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmModal } from "../../components/common/ConfirmModal";

describe("ConfirmModal", () => {
  const defaultProps = {
    message: "确定要跳过当前阶段吗？",
    primaryLabel: "确定",
    secondaryLabel: "取消",
    onPrimary: vi.fn(),
    onSecondary: vi.fn(),
    onDismiss: vi.fn(),
  };

  // ==================== Happy Path ====================
  it("should render the message", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText("确定要跳过当前阶段吗？")).toBeInTheDocument();
  });

  it("should render primary button with given label", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText("确定")).toBeInTheDocument();
  });

  it("should render secondary button with given label", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText("取消")).toBeInTheDocument();
  });

  it("should call onPrimary when primary button clicked", () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText("确定"));
    expect(defaultProps.onPrimary).toHaveBeenCalledTimes(1);
  });

  it("should call onSecondary when secondary button clicked", () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText("取消"));
    expect(defaultProps.onSecondary).toHaveBeenCalledTimes(1);
  });

  // ==================== Overlay Click ====================
  it("should call onDismiss when overlay/backdrop is clicked", () => {
    render(<ConfirmModal {...defaultProps} />);
    // Click the backdrop (usually the outermost div)
    const backdrop = screen.getByText("确定要跳过当前阶段吗？").parentElement?.parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(defaultProps.onDismiss).toHaveBeenCalled();
    }
  });

  // ==================== Accessibility ====================
  it("should have a dialog role", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should close on Escape key", () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(defaultProps.onDismiss).toHaveBeenCalled();
  });
});
