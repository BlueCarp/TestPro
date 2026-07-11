/**
 * 计时器核心类型定义
 *
 * 与 specs/api-contract.yaml 中 components/schemas 严格对齐。
 * 使用 type 和 interface 而非 enum（与 Zustand 序列化兼容）。
 */

/** 计时器当前所处的阶段类型 */
export type Phase = "work" | "short_break" | "long_break";

/** 计时器运行状态 */
export type Status = "idle" | "running" | "paused";

/** 计时器可接收的动作类型 */
export type TimerActionType =
  | "START"
  | "PAUSE"
  | "RESUME"
  | "RESET"
  | "SKIP"
  | "TIMER_COMPLETE";

/** 计时器动作 */
export interface TimerAction {
  type: TimerActionType;
}

/**
 * 计时器完整运行时状态。
 * 此状态仅存在于内存中，应用重启后重置为 idle。
 *
 * 约束：
 * - status=idle 仅在 phase=work 时合法
 * - startedAt 和 pausedAt 互斥（至少一个为 null）
 * - completedPomodoros 范围 [0, 4]
 * - remainingSeconds 范围 [0, 7200]
 */
export interface TimerState {
  phase: Phase;
  status: Status;
  remainingSeconds: number;
  completedPomodoros: number;
  startedAt: number | null;
  pausedAt: number | null;
}

/** 计时器引擎 tick 结果 */
export interface TickResult {
  remainingSeconds: number;
  expired: boolean;
}

/** 计时器引擎接口 */
export interface TimerEngine {
  start(now: number): void;
  pause(now: number): void;
  resume(now: number): void;
  reset(): void;
  getRemainingSeconds(now: number): number;
  tick(now: number): TickResult;
}

/** 状态转换错误 */
export class StateTransitionError extends Error {
  constructor(
    message: string,
    public readonly from: string,
    public readonly action: string,
  ) {
    super(message);
    this.name = "StateTransitionError";
  }
}
