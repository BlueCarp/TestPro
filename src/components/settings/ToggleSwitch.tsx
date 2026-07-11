import type { FC } from "react";

interface ToggleSwitchProps {
  /** 当前开关状态 */
  checked: boolean;
  /** 标签文案 */
  label: string;
  /** 状态变化回调 */
  onChange: (checked: boolean) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 开关组件
 *
 * 可视化切换布尔值状态，点击切换 checked，
 * 提供清晰的视觉反馈（颜色 + 滑块动画）。
 *
 * 用途：
 * - 通知声音开关
 * - 桌面通知开关
 */
const ToggleSwitch: FC<ToggleSwitchProps> = ({
  checked,
  label,
  onChange,
  disabled = false,
}) => {
  const handleClick = () => {
    if (disabled) return;
    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-label={label}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{ fontSize: "15px", color: "#333" }}>{label}</span>
      <div
        style={{
          width: "48px",
          height: "26px",
          borderRadius: "13px",
          backgroundColor: checked ? "#2ecc71" : "#d0d0d0",
          position: "relative",
          transition: "background-color 0.2s ease",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "11px",
            backgroundColor: "#fff",
            position: "absolute",
            top: "2px",
            left: checked ? "24px" : "2px",
            transition: "left 0.2s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </div>
  );
};

export { ToggleSwitch };
export type { ToggleSwitchProps };
