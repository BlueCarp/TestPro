import type { FC } from "react";
import { useState, useCallback, useEffect } from "react";
import type { SettingsValidationError } from "../../types/settings";

interface DurationInputProps {
  /** 当前分钟数 */
  value: number;
  /** 字段名称（用于校验错误信息） */
  fieldName: "workMinutes" | "shortBreakMinutes" | "longBreakMinutes";
  /** 标签文案 */
  label: string;
  /** 值变化回调（分钟数） */
  onChange: (value: number) => void;
  /** 校验错误（来自 settingsStore.save 的结果） */
  error?: SettingsValidationError | null;
}

/**
 * 时长调节组件
 *
 * 支持 [-] 数字 [+] 三种交互方式：
 * - 点击 [-] 减 1 分钟
 * - 点击 [+] 加 1 分钟
 * - 直接输入数字
 *
 * 范围限制：[1, 120]，超出部分在 blur 时自动钳位。
 * 保存时通过 validateDuration 做严格校验，失败行高亮。
 *
 * 使用本地 state 管理编辑状态，避免每次 +/- 都触发 settingsStore 更新，
 * 仅在保存时将本地状态写入 store。
 */
const DurationInput: FC<DurationInputProps> = ({
  value,
  fieldName,
  label,
  onChange,
  error,
}) => {
  const [localValue, setLocalValue] = useState(String(value));

  // 外部 value 变化时同步本地 state（如 resetDefaults）
  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  /** 减少 1 分钟，不超出 [1, 120] */
  const handleDecrement = useCallback(() => {
    const newVal = Math.max(1, value - 1);
    setLocalValue(String(newVal));
    onChange(newVal);
  }, [value, onChange]);

  /** 增加 1 分钟，不超出 [1, 120] */
  const handleIncrement = useCallback(() => {
    const newVal = Math.min(120, value + 1);
    setLocalValue(String(newVal));
    onChange(newVal);
  }, [value, onChange]);

  /** 直接输入处理 */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // 允许空字符串和负号，避免输入过程中立即报错
      if (raw === "" || raw === "-") {
        setLocalValue(raw);
        return;
      }
      const num = parseInt(raw, 10);
      if (!isNaN(num)) {
        setLocalValue(raw);
        // 钳位到 [1, 120]
        const clamped = Math.max(1, Math.min(120, num));
        onChange(clamped);
      }
    },
    [onChange],
  );

  /** 失焦时钳位并刷新本地值 */
  const handleBlur = useCallback(() => {
    const num = parseInt(localValue, 10);
    if (isNaN(num) || localValue === "" || localValue === "-") {
      // 无效输入，恢复当前 store 值
      setLocalValue(String(value));
      return;
    }
    const clamped = Math.max(1, Math.min(120, num));
    setLocalValue(String(clamped));
    if (clamped !== value) {
      onChange(clamped);
    }
  }, [localValue, value, onChange]);

  const hasError = error?.field === fieldName;

  return (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "15px",
          color: "#333",
          marginBottom: "8px",
        }}
      >
        <span>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={handleDecrement}
            aria-label={`减少 ${label}`}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              border: "1px solid #d0d0d0",
              backgroundColor: "#fff",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#333",
            }}
          >
            −
          </button>
          <input
            type="text"
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            aria-label={`${label} 分钟数`}
            style={{
              width: "60px",
              height: "32px",
              textAlign: "center",
              fontSize: "15px",
              border: `2px solid ${hasError ? "#e74c3c" : "#d0d0d0"}`,
              borderRadius: "6px",
              outline: "none",
              backgroundColor: hasError ? "#fef2f2" : "#fff",
              color: hasError ? "#e74c3c" : "#333",
            }}
          />
          <button
            type="button"
            onClick={handleIncrement}
            aria-label={`增加 ${label}`}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              border: "1px solid #d0d0d0",
              backgroundColor: "#fff",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#333",
            }}
          >
            +
          </button>
          <span style={{ fontSize: "13px", color: "#888", minWidth: "24px" }}>
            分钟
          </span>
        </div>
      </label>
      {hasError && (
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "13px",
            color: "#e74c3c",
          }}
        >
          {error.message}
        </p>
      )}
    </div>
  );
};

export { DurationInput };
export type { DurationInputProps };
