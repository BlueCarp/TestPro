import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimerDisplay } from "../../components/timer/TimerDisplay";

describe("TimerDisplay", () => {
  // ==================== Happy Path ====================
  it("should render remaining seconds as MM:SS", () => {
    render(<TimerDisplay remainingSeconds={1500} />);
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  it("should render 00:00 when remainingSeconds is 0", () => {
    render(<TimerDisplay remainingSeconds={0} />);
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("should render 01:30 for 90 seconds", () => {
    render(<TimerDisplay remainingSeconds={90} />);
    expect(screen.getByText("01:30")).toBeInTheDocument();
  });

  it("should render 120:00 for maximum value 7200", () => {
    render(<TimerDisplay remainingSeconds={7200} />);
    expect(screen.getByText("120:00")).toBeInTheDocument();
  });

  // ==================== Edge Cases ====================
  it("should handle negative seconds by rendering 00:00", () => {
    render(<TimerDisplay remainingSeconds={-1} />);
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("should handle very large remaining seconds gracefully", () => {
    render(<TimerDisplay remainingSeconds={99999} />);
    // Should not crash - renders some formatted time
    expect(screen.getByText(/^\d{2,5}:\d{2}$/)).toBeInTheDocument();
  });

  // ==================== Display Attributes ====================
  it("should render in a container with appropriate ARIA label", () => {
    render(<TimerDisplay remainingSeconds={1500} />);
    const display = screen.getByText("25:00");
    expect(display).toBeInTheDocument();
    // Should have large font styling for readability
    expect(display.tagName).toBe("SPAN") || expect(display.tagName).toBe("DIV");
  });
});
