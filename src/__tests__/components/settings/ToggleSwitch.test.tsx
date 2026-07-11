import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToggleSwitch } from "../../../components/settings/ToggleSwitch";

describe("ToggleSwitch", () => {
  const defaultProps = {
    checked: false,
    label: "提示音通知",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== Rendering ====================
  describe("rendering", () => {
    it("should render the label", () => {
      render(<ToggleSwitch {...defaultProps} />);
      expect(screen.getByLabelText("提示音通知")).toBeInTheDocument();
    });

    it("should render as a role=switch element", () => {
      const { container } = render(<ToggleSwitch {...defaultProps} />);
      const el = container.querySelector('[role="switch"]');
      expect(el).toBeInTheDocument();
    });

    it("should have correct aria-checked", () => {
      render(<ToggleSwitch {...defaultProps} checked={false} />);
      expect(screen.getByLabelText("提示音通知")).toHaveAttribute("aria-checked", "false");
    });

    it("should have aria-checked=true when checked", () => {
      render(<ToggleSwitch {...defaultProps} checked={true} />);
      expect(screen.getByLabelText("提示音通知")).toHaveAttribute("aria-checked", "true");
    });
  });

  // ==================== Toggle Behavior ====================
  describe("toggle behavior", () => {
    it("should call onChange with true when clicked from unchecked", () => {
      const onChange = vi.fn();
      render(<ToggleSwitch {...defaultProps} checked={false} onChange={onChange} />);
      fireEvent.click(screen.getByLabelText("提示音通知"));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("should call onChange with false when clicked from checked", () => {
      const onChange = vi.fn();
      render(<ToggleSwitch {...defaultProps} checked={true} onChange={onChange} />);
      fireEvent.click(screen.getByLabelText("提示音通知"));
      expect(onChange).toHaveBeenCalledWith(false);
    });
  });

  // ==================== Keyboard Support ====================
  describe("keyboard support", () => {
    it("should toggle on Enter key", () => {
      const onChange = vi.fn();
      render(<ToggleSwitch {...defaultProps} checked={false} onChange={onChange} />);
      const el = screen.getByLabelText("提示音通知");
      fireEvent.keyDown(el, { key: "Enter" });
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("should toggle on Space key", () => {
      const onChange = vi.fn();
      render(<ToggleSwitch {...defaultProps} checked={true} onChange={onChange} />);
      const el = screen.getByLabelText("提示音通知");
      fireEvent.keyDown(el, { key: " " });
      expect(onChange).toHaveBeenCalledWith(false);
    });
  });

  // ==================== Disabled State ====================
  describe("disabled state", () => {
    it("should not toggle when disabled", () => {
      const onChange = vi.fn();
      render(
        <ToggleSwitch
          {...defaultProps}
          checked={false}
          onChange={onChange}
          disabled
        />,
      );
      fireEvent.click(screen.getByLabelText("提示音通知"));
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should have tabindex=-1 when disabled", () => {
      render(
        <ToggleSwitch
          {...defaultProps}
          checked={false}
          disabled
        />,
      );
      const el = screen.getByLabelText("提示音通知");
      expect(el).toHaveAttribute("tabindex", "-1");
    });
  });
});
