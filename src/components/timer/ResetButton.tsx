/**
 * ResetButton 组件
 *
 * 重置按钮，仅 paused 状态下显示。
 * 点击后将计时器重置为初始时长。
 *
 * 符合 wireframes.md 第 4.1 节中 ResetButton 的设计：
 * - 灰色次要按钮样式
 */

import type { FC, KeyboardEvent } from "react";

interface ResetButtonProps {
  /** 点击重置的回调 */
  onReset: () => void;
  /** 是否禁用 */
  disabled?: boolean;
}

const ResetButton: FC<ResetButtonProps> = ({ onReset, disabled = false }) => {
  const handleClick = () => {
    if (!disabled && onReset) {
      onReset();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label="重置计时器"
      style={{
        padding: "10px 32px",
        fontSize: "16px",
        fontWeight: 600,
        color: "#666",
        backgroundColor: "transparent",
        border: "1px solid #d0d0d0",
        borderRadius: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        outline: "none",
      }}
    >
      重置
    </button>
  );
};

export { ResetButton };
export type { ResetButtonProps };
