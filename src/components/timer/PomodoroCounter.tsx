/**
 * PomodoroCounter 组件
 *
 * 显示已完成番茄钟数量："🍅 × N"。
 * 用于 FR-09 番茄钟计数功能。
 *
 * 符合 wireframes.md 第 4.1 节中 PomodoroCounter 的设计：
 * - 位于倒计时下方
 * - 显示当前连续完成的番茄数
 */

import type { FC } from "react";

interface PomodoroCounterProps {
  /** 已完成的番茄钟数量 */
  count: number;
}

const PomodoroCounter: FC<PomodoroCounterProps> = ({ count }) => {
  const displayCount = Math.max(0, count);

  return (
    <div
      aria-label={`已完成番茄钟：${displayCount}`}
      style={{
        fontSize: "18px",
        fontWeight: 500,
        color: "#555",
        textAlign: "center",
        marginTop: "8px",
        userSelect: "none",
      }}
    >
      🍅 × {displayCount}
    </div>
  );
};

export { PomodoroCounter };
export type { PomodoroCounterProps };
