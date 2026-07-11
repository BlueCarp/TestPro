/**
 * PhaseLabel 组件
 *
 * 根据当前 phase 显示阶段名称 + 色点：
 * - work → 🔴 工作
 * - short_break → 🟢 短休息
 * - long_break → 🔵 长休息
 *
 * 符合 wireframes.md 第 4.1 节（计时器主页线框图）中 PhaseLabel 的设计。
 */

import type { FC } from "react";
import type { Phase } from "../../types/timer";

interface PhaseLabelProps {
  /** 当前阶段 */
  phase: Phase;
}

/** 阶段名称与色点映射 */
const PHASE_CONFIG: Record<Phase, { label: string; dot: string }> = {
  work: { label: "工作", dot: "🔴" },
  short_break: { label: "短休息", dot: "🟢" },
  long_break: { label: "长休息", dot: "🔵" },
};

const PhaseLabel: FC<PhaseLabelProps> = ({ phase }) => {
  const config = PHASE_CONFIG[phase as Phase] ?? { label: String(phase), dot: "⚪" };

  return (
    <div
      aria-label={`当前阶段：${config.label}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "18px",
        fontWeight: 600,
        color: "#1a1a1a",
        marginBottom: "16px",
      }}
    >
      {config.dot}
      {config.label}
    </div>
  );
};

export { PhaseLabel };
export type { PhaseLabelProps };
