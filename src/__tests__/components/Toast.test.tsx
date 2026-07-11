import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Toast } from "../../components/common/Toast";

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ==================== Happy Path ====================
  it("should render the message", () => {
    render(<Toast message="设置已保存" type="success" />);
    expect(screen.getByText("设置已保存")).toBeInTheDocument();
  });

  it("should render success type with appropriate styling", () => {
    render(<Toast message="设置已保存" type="success" />);
    expect(screen.getByText("设置已保存")).toBeInTheDocument();
  });

  it("should render error type with appropriate styling", () => {
    render(<Toast message="保存失败" type="error" />);
    expect(screen.getByText("保存失败")).toBeInTheDocument();
  });

  // ==================== Auto-Dismiss ====================
  it("should auto-dismiss after default duration", () => {
    const onDismiss = vi.fn();
    render(<Toast message="设置已保存" type="success" onDismiss={onDismiss} />);

    expect(screen.getByText("设置已保存")).toBeInTheDocument();

    // Fast forward past default duration (2000ms)
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    // After duration, the toast should call onDismiss
    expect(onDismiss).toHaveBeenCalled();
  });

  it("should auto-dismiss after custom duration", () => {
    const onDismiss = vi.fn();
    render(<Toast message="通知" type="success" duration={5000} onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(5500);
    });

    expect(onDismiss).toHaveBeenCalled();
  });

  it("should not auto-dismiss when duration is 0", () => {
    const onDismiss = vi.fn();
    render(<Toast message="永久提示" type="success" duration={0} onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  // ==================== Cleanup ====================
  it("should clear timer on unmount", () => {
    const onDismiss = vi.fn();
    const { unmount } = render(
      <Toast message="设置已保存" type="success" onDismiss={onDismiss} />
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
