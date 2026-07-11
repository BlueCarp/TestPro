import { describe, it, expect } from "vitest";
import { formatTime } from "../../utils/formatTime";

describe("formatTime", () => {
  // ==================== Happy Path ====================
  it("should format 0 seconds as 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("should format 30 seconds as 00:30", () => {
    expect(formatTime(30)).toBe("00:30");
  });

  it("should format 90 seconds as 01:30", () => {
    expect(formatTime(90)).toBe("01:30");
  });

  it("should format 1500 seconds (25 min) as 25:00", () => {
    expect(formatTime(1500)).toBe("25:00");
  });

  it("should format 3661 seconds as 61:01", () => {
    expect(formatTime(3661)).toBe("61:01");
  });

  it("should format 7200 seconds (max) as 120:00", () => {
    expect(formatTime(7200)).toBe("120:00");
  });

  it("should pad single-digit minutes with leading zero", () => {
    expect(formatTime(60)).toBe("01:00");
    expect(formatTime(61)).toBe("01:01");
    expect(formatTime(119)).toBe("01:59");
  });

  it("should pad single-digit seconds with leading zero", () => {
    expect(formatTime(1)).toBe("00:01");
    expect(formatTime(9)).toBe("00:09");
    expect(formatTime(10)).toBe("00:10");
  });

  it("should handle exactly 1 minute", () => {
    expect(formatTime(60)).toBe("01:00");
  });

  it("should handle exactly 1 hour", () => {
    expect(formatTime(3600)).toBe("60:00");
  });

  // ==================== Edge Cases ====================
  it("should handle negative seconds by treating as 0 or returning 00:00", () => {
    // remainingSeconds is clamped >= 0 per spec, but defensive
    expect(formatTime(-1)).toBe("00:00");
  });

  it("should handle fractional seconds by flooring", () => {
    expect(formatTime(90.7)).toBe("01:30");
    expect(formatTime(90.3)).toBe("01:30");
    expect(formatTime(0.9)).toBe("00:00");
  });

  it("should handle very large values gracefully", () => {
    expect(formatTime(999999)).toBe("16666:39");
  });

  // ==================== Sad Path ====================
  it("should handle NaN by returning 00:00 or throwing gracefully", () => {
    // Defensive: implementation should handle invalid input
    expect(formatTime(NaN)).toBe("00:00");
  });

  it("should handle undefined/null by returning 00:00 or throwing gracefully", () => {
    // @ts-expect-error - testing runtime behavior with invalid types
    const result = formatTime(undefined);
    expect(result).toBe("00:00");
  });
});
