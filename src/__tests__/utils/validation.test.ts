import { describe, it, expect } from "vitest";
import { validateDuration } from "../../utils/validation";

describe("validateDuration", () => {
  // ==================== Happy Path ====================
  it("should return null for valid workMinutes value 25", () => {
    expect(validateDuration(25, "workMinutes")).toBeNull();
  });

  it("should return null for valid value 1 (minimum)", () => {
    expect(validateDuration(1, "shortBreakMinutes")).toBeNull();
  });

  it("should return null for valid value 120 (maximum)", () => {
    expect(validateDuration(120, "longBreakMinutes")).toBeNull();
  });

  it("should return null for mid-range value 30", () => {
    expect(validateDuration(30, "workMinutes")).toBeNull();
  });

  // ==================== Edge Cases ====================
  it("should return null for boundary value 1 (min inclusive)", () => {
    expect(validateDuration(1, "workMinutes")).toBeNull();
  });

  it("should return null for boundary value 120 (max inclusive)", () => {
    expect(validateDuration(120, "workMinutes")).toBeNull();
  });

  // ==================== Sad Path ====================
  it("should return error for value 0", () => {
    const result = validateDuration(0, "shortBreakMinutes");
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("field", "shortBreakMinutes");
    expect(result).toHaveProperty("message");
    expect(result!.message).toBeTruthy();
  });

  it("should return error for negative value", () => {
    const result = validateDuration(-1, "workMinutes");
    expect(result).not.toBeNull();
    expect(result!.field).toBe("workMinutes");
    expect(result!.message).toBeTruthy();
  });

  it("should return error for value exceeding maximum 120", () => {
    const result = validateDuration(121, "longBreakMinutes");
    expect(result).not.toBeNull();
    expect(result!.field).toBe("longBreakMinutes");
    expect(result!.message).toBeTruthy();
  });

  it("should return error for extremely large value", () => {
    const result = validateDuration(999999, "workMinutes");
    expect(result).not.toBeNull();
    expect(result!.field).toBe("workMinutes");
  });

  it("should return error for floating point value", () => {
    const result = validateDuration(25.5, "workMinutes");
    expect(result).not.toBeNull();
    expect(result!.field).toBe("workMinutes");
  });

  it("should return error for NaN", () => {
    const result = validateDuration(NaN, "workMinutes");
    expect(result).not.toBeNull();
    expect(result!.field).toBe("workMinutes");
  });

  // ==================== Field-Specific Behavior ====================
  it("should set correct field name for workMinutes", () => {
    const result = validateDuration(0, "workMinutes");
    expect(result!.field).toBe("workMinutes");
  });

  it("should set correct field name for shortBreakMinutes", () => {
    const result = validateDuration(0, "shortBreakMinutes");
    expect(result!.field).toBe("shortBreakMinutes");
  });

  it("should set correct field name for longBreakMinutes", () => {
    const result = validateDuration(0, "longBreakMinutes");
    expect(result!.field).toBe("longBreakMinutes");
  });

  it("should provide a user-facing error message", () => {
    const result = validateDuration(0, "shortBreakMinutes");
    expect(result!.message.length).toBeGreaterThan(0);
    // Message should mention valid range
    expect(result!.message).toMatch(/[1-9]/);
  });

  // ==================== Error Shape ====================
  it("should return an object with field and message properties", () => {
    const result = validateDuration(0, "workMinutes");
    expect(result).toHaveProperty("field");
    expect(result).toHaveProperty("message");
    expect(typeof result!.field).toBe("string");
    expect(typeof result!.message).toBe("string");
  });
});
