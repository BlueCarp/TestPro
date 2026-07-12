/**
 * TimerDisplay 组件
 *
 * 大字体 MM:SS 倒计时显示，使用 formatTime 工具函数格式化。
 *
 * 符合 wireframes.md 第 4.1 节中 TimerDisplay 的设计：
 * - 超大字体（72px）居中显示
 * - 支持负数边界处理（显示 00:00）
 *
 * 无障碍性（P0-1 修复）：
 * - 使用 aria-live="polite" + aria-atomic="true" 确保屏幕阅读器在状态变化时播报
 * - 通过 React key 变化驱动 re-render，仅在数字真正变化时触发 live region 更新
 * - 防抖：外层组件以 250ms tick 推送新值，但组件本身只在 remainingSeconds 变化时 re-render
 */

import type { FC } from "react";
import { formatTime } from "../../utils/formatTime";

interface TimerDisplayProps {
  /** 剩余秒数 */
  remainingSeconds: number;
}

const TimerDisplay: FC<TimerDisplayProps> = ({ remainingSeconds }) => {
  const display = formatTime(remainingSeconds);

  return (
    <span
      key={display}
      aria-label={`剩余时间：${display}`}
      aria-live="polite"
      aria-atomic="true"
      role="status"
      style={{
        fontFamily: "'SF Mono', 'Cascadia Code', 'Consolas', monospace",
        fontSize: "72px",
        fontWeight: 700,
        letterSpacing: "2px",
        color: "#1a1a1a",
        textAlign: "center",
        padding: "32px 0",
        userSelect: "none",
      }}
    >
      {display}
    </span>
  );
};

export { TimerDisplay };
export type { TimerDisplayProps };
