import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DurationInput } from "../../../components/settings/DurationInput";

describe("DurationInput", () => {
  const defaultProps = {
    value: 25,
    fieldName: "workMinutes" as const,
    label: "工作时长",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== Rendering ====================
  describe("rendering", () => {
    it("should render the label", () => {
      render(<DurationInput {...defaultProps} />);
      expect(screen.getByLabelText("工作时长 分钟数")).toBeInTheDocument();
    });

    it("should display the current value in the input", () => {
      render(<DurationInput {...defaultProps} />);
      const input = screen.getByLabelText("工作时长 分钟数") as HTMLInputElement;
      expect(input.value).toBe("25");
    });

    it("should render decrement and increment buttons", () => {
      render(<DurationInput {...defaultProps} />);
      expect(screen.getByLabelText("减少 工作时长")).toBeInTheDocument();
      expect(screen.getByLabelText("增加 工作时长")).toBeInTheDocument();
    });
  });

  // ==================== Decrement ====================
  describe("decrement", () => {
    it("should decrease value by 1", () => {
      const onChange = vi.fn();
      render(<DurationInput {...defaultProps} onChange={onChange} />);
      fireEvent.click(screen.getByLabelText("减少 工作时长"));
      expect(onChange).toHaveBeenCalledWith(24);
    });

    it("should not go below 1", () => {
      const props = { ...defaultProps, value: 1, onChange: vi.fn() };
      render(<DurationInput {...props} />);
      fireEvent.click(screen.getByLabelText("减少 工作时长"));
      expect(props.onChange).toHaveBeenCalledWith(1);
    });
  });

  // ==================== Increment ====================
  describe("increment", () => {
    it("should increase value by 1", () => {
      const onChange = vi.fn();
      render(<DurationInput {...defaultProps} onChange={onChange} />);
      fireEvent.click(screen.getByLabelText("增加 工作时长"));
      expect(onChange).toHaveBeenCalledWith(26);
    });

    it("should not go above 120", () => {
      const props = { ...defaultProps, value: 120, onChange: vi.fn() };
      render(<DurationInput {...props} />);
      fireEvent.click(screen.getByLabelText("增加 工作时长"));
      expect(props.onChange).toHaveBeenCalledWith(120);
    });
  });

  // ==================== Direct Input ====================
  describe("direct input", () => {
    it("should update on direct number input", () => {
      const onChange = vi.fn();
      render(<DurationInput {...defaultProps} onChange={onChange} />);
      const input = screen.getByLabelText("工作时长 分钟数") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "30" } });
      expect(onChange).toHaveBeenCalledWith(30);
    });

    it("should clamp value to [1, 120] on blur", () => {
      const onChange = vi.fn();
      render(<DurationInput {...defaultProps} onChange={onChange} />);
      const input = screen.getByLabelText("工作时长 分钟数") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "200" } });
      fireEvent.blur(input);
      expect(onChange).toHaveBeenCalledWith(120);
    });

    it("should clamp negative input to 1 on blur", () => {
      const onChange = vi.fn();
      render(<DurationInput {...defaultProps} onChange={onChange} />);
      const input = screen.getByLabelText("工作时长 分钟数") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "-5" } });
      fireEvent.blur(input);
      expect(onChange).toHaveBeenCalledWith(1);
    });
  });

  // ==================== Error Display ====================
  describe("error display", () => {
    it("should show error when field has validation error", () => {
      const error = { field: "workMinutes" as const, message: "请输入有效的时长（1–120 分钟）" };
      render(<DurationInput {...defaultProps} error={error} />);
      const input = screen.getByLabelText("工作时长 分钟数") as HTMLInputElement;
      expect(input.style.borderColor).toBe("rgb(231, 76, 60)");
    });

    it("should not show error border when no error", () => {
      render(<DurationInput {...defaultProps} />);
      const input = screen.getByLabelText("工作时长 分钟数") as HTMLInputElement;
      expect(input.style.borderColor).not.toBe("rgb(231, 76, 60)");
    });
  });

  // ==================== External Value Sync ====================
  describe("external value sync", () => {
    it("should update local state when value prop changes", () => {
      const { rerender } = render(<DurationInput {...defaultProps} />);
      rerender(<DurationInput {...defaultProps} value={30} />);
      const input = screen.getByLabelText("工作时长 分钟数") as HTMLInputElement;
      expect(input.value).toBe("30");
    });
  });
});
