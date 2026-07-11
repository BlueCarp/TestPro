import type { SettingsValidationError } from "../types/settings";

/**
 * 校验时长字段值是否在有效范围 [1, 120] 内。
 *
 * @param value - 待校验的数值
 * @param field - 字段名称
 * @returns 校验通过返回 null，否则返回 SettingsValidationError
 *
 * @example
 * validateDuration(25, "workMinutes")           // → null
 * validateDuration(0, "shortBreakMinutes")      // → { field, message }
 * validateDuration(121, "longBreakMinutes")     // → { field, message }
 */
export function validateDuration(
  value: number,
  field: "workMinutes" | "shortBreakMinutes" | "longBreakMinutes",
): SettingsValidationError | null {
  // 非数字、NaN、浮点数均视为无效
  if (typeof value !== "number" || isNaN(value) || !Number.isInteger(value)) {
    return {
      field,
      message: `请输入有效的时长（1–120 分钟）`,
    };
  }

  if (value < 1 || value > 120) {
    return {
      field,
      message: `请输入有效的时长（1–120 分钟）`,
    };
  }

  return null;
}
