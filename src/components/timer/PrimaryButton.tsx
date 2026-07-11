/**
 * PrimaryButton 组件
 *
 * 主操作按钮，根据 status 显示不同文案：
 * - idle → "开始"
 * - running → "暂停"
 * - paused → "继续"
 *
 * 符合 wireframes.md 第 4.1 节中 PrimaryButton 的设计：
 * - 大号醒目按钮，使用品牌色（#e74c3c）
 * - 支持键盘 Enter/Space 激活
 */

import type { FC } from "react";
import type { Status } from "../../types/timer";

interface PrimaryButtonProps {
  /** 当前计时器状态 */
  status: Status;
  /** 点击回调 */
  onClick: () => void;
}

const STATUS_LABELS: Record<Status, string> = {
  idle: "开始",
  running: "暂停",
  paused: "继续",
};

const PrimaryButton: FC<PrimaryButtonProps> = ({ status, onClick }) => {
  const label = STATUS_LABELS[status] ?? "开始";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={label}
      style={{
        padding: "16px 64px",
        fontSize: "20px",
        fontWeight: 700,
        color: "#fff",
        backgroundColor: "#e74c3c",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        outline: "none",
      }}
    >
      {label}
    </button>
  );
};

export { PrimaryButton };
export type { PrimaryButtonProps };
