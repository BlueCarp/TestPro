/**
 * SkipButton 组件
 *
 * 次要操作按钮，点击后触发 onSkip 回调。
 * 在 idle 状态下隐藏（disabled）。
 *
 * 注意：ConfirmModal 的弹出逻辑由上层组件（TimerPage）管理，
 * SkipButton 仅负责触发 onSkip 事件。
 *
 * 符合 wireframes.md 第 4.1 节中 SkipButton 的设计：
 * - 次要样式，边框按钮
 */

import type { FC, KeyboardEvent } from "react";

interface SkipButtonProps {
  /** 点击跳过的回调 */
  onSkip: (() => void) | undefined;
  /** 是否禁用 */
  disabled?: boolean;
}

const SkipButton: FC<SkipButtonProps> = ({ onSkip, disabled = false }) => {
  const handleClick = () => {
    if (!disabled && onSkip) {
      onSkip();
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
      aria-label="跳过当前阶段"
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
      跳过
    </button>
  );
};

export { SkipButton };
export type { SkipButtonProps };
