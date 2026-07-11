import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PhaseLabel } from "../../components/timer/PhaseLabel";

describe("PhaseLabel", () => {
  // ==================== Happy Path ====================
  it("should display '工作' when phase is work", () => {
    render(<PhaseLabel phase="work" />);
    expect(screen.getByText(/工作/)).toBeInTheDocument();
  });

  it("should display '短休息' when phase is short_break", () => {
    render(<PhaseLabel phase="short_break" />);
    expect(screen.getByText(/短休息|Short Break/i)).toBeInTheDocument();
  });

  it("should display '长休息' when phase is long_break", () => {
    render(<PhaseLabel phase="long_break" />);
    expect(screen.getByText(/长休息|Long Break/i)).toBeInTheDocument();
  });

  // ==================== Edge Cases ====================
  it("should handle unknown phase gracefully", () => {
    render(<PhaseLabel phase={"unknown" as any} />);
    // Should still render without error
    expect(screen.getByText(/./)).toBeInTheDocument();
  });
});
