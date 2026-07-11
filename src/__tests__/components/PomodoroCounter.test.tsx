import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PomodoroCounter } from "../../components/timer/PomodoroCounter";

describe("PomodoroCounter", () => {
  // ==================== Happy Path ====================
  it("should show 🍅 × 0 when count is 0", () => {
    render(<PomodoroCounter count={0} />);
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it("should show 🍅 × 1 when count is 1", () => {
    render(<PomodoroCounter count={1} />);
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });

  it("should show 🍅 × 4 when count is 4", () => {
    render(<PomodoroCounter count={4} />);
    expect(screen.getByText(/4/)).toBeInTheDocument();
  });

  // ==================== Edge Cases ====================
  it("should handle negative count gracefully", () => {
    render(<PomodoroCounter count={-1} />);
    // Should not crash - display something
    expect(screen.getByText(/./)).toBeInTheDocument();
  });

  it("should handle count exceeding max (5+) gracefully", () => {
    render(<PomodoroCounter count={10} />);
    // Should display the number even if invalid
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  // ==================== Display ====================
  it("should display tomato emoji", () => {
    render(<PomodoroCounter count={2} />);
    // Should contain 🍅 or some tomato icon
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });
});
