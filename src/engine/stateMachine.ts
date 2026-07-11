/**
 * 状态机模块
 *
 * 定义计时器的合法状态和转换规则。
 * 纯函数模块，不依赖任何外部状态。
 * 基于 api-contract.yaml 中 x-state-machine 的全部转换规则。
 */

import type { TimerState, TimerAction } from "../types/timer";
import { StateTransitionError } from "../types/timer";
import type { DurationConfig } from "../types/settings";

/**
 * 根据当前状态和动作执行状态转换。
 *
 * @param state - 当前计时器状态
 * @param action - 触发转换的动作
 * @param settings - 时长配置
 * @returns 新的计时器状态
 * @throws {StateTransitionError} 当转换非法时抛出
 */
export function transition(
  state: TimerState,
  action: TimerAction,
  settings: DurationConfig,
): TimerState {
  const { phase, status, completedPomodoros } = state;

  switch (action.type) {
    // ================================================================
    // START
    // ================================================================
    case "START":
      if (phase === "work" && status === "idle") {
        return {
          ...state,
          status: "running",
          remainingSeconds: settings.workMinutes * 60,
        };
      }
      throw new StateTransitionError(
        `START 不允许从 (${phase}, ${status}) 状态`,
        `${phase}_${status}`,
        "START",
      );

    // ================================================================
    // PAUSE
    // ================================================================
    case "PAUSE":
      if (status === "running") {
        return {
          ...state,
          status: "paused",
        };
      }
      throw new StateTransitionError(
        `PAUSE 不允许从 (${phase}, ${status}) 状态`,
        `${phase}_${status}`,
        "PAUSE",
      );

    // ================================================================
    // RESUME
    // ================================================================
    case "RESUME":
      if (status === "paused") {
        return {
          ...state,
          status: "running",
        };
      }
      throw new StateTransitionError(
        `RESUME 不允许从 (${phase}, ${status}) 状态`,
        `${phase}_${status}`,
        "RESUME",
      );

    // ================================================================
    // RESET
    // ================================================================
    case "RESET":
      if (status === "paused") {
        if (phase === "long_break") {
          // 长休息重置 → 回到 idle 并重置计数
          return {
            phase: "work",
            status: "idle",
            remainingSeconds: settings.workMinutes * 60,
            completedPomodoros: 0,
            startedAt: null,
            pausedAt: null,
          };
        }
        // work 或 short_break 暂停 → 回到 idle，计数不变
        return {
          phase: "work",
          status: "idle",
          remainingSeconds: settings.workMinutes * 60,
          completedPomodoros: state.completedPomodoros,
          startedAt: null,
          pausedAt: null,
        };
      }
      throw new StateTransitionError(
        `RESET 不允许从 (${phase}, ${status}) 状态`,
        `${phase}_${status}`,
        "RESET",
      );

    // ================================================================
    // SKIP
    // ================================================================
    case "SKIP":
      return handleSkip(state, settings);

    // ================================================================
    // TIMER_COMPLETE
    // ================================================================
    case "TIMER_COMPLETE":
      if (status !== "running") {
        throw new StateTransitionError(
          `TIMER_COMPLETE 不允许从 (${phase}, ${status}) 状态`,
          `${phase}_${status}`,
          "TIMER_COMPLETE",
        );
      }
      return handleTimerComplete(state, settings);

    default:
      throw new StateTransitionError(
        `未知动作类型: ${(action as any).type}`,
        `${phase}_${status}`,
        (action as any).type,
      );
  }
}

/**
 * 处理 SKIP 动作。
 */
function handleSkip(state: TimerState, settings: DurationConfig): TimerState {
  const { phase, status, completedPomodoros } = state;

  if (phase === "work" && (status === "running" || status === "paused")) {
    if (completedPomodoros < 3) {
      return {
        ...state,
        phase: "short_break",
        status: "running",
        remainingSeconds: settings.shortBreakMinutes * 60,
        completedPomodoros: completedPomodoros + 1,
        startedAt: null,
        pausedAt: null,
      };
    }
    // completedPomodoros === 3 (第 4 个番茄钟，应进入长休息)
    return {
      ...state,
      phase: "long_break",
      status: "running",
      remainingSeconds: settings.longBreakMinutes * 60,
      completedPomodoros: 4,
      startedAt: null,
      pausedAt: null,
    };
  }

  if (phase === "short_break" && (status === "running" || status === "paused")) {
    return {
      ...state,
      phase: "work",
      status: "running",
      remainingSeconds: settings.workMinutes * 60,
      completedPomodoros: state.completedPomodoros,
      startedAt: null,
      pausedAt: null,
    };
  }

  if (phase === "long_break" && (status === "running" || status === "paused")) {
    // 跳过长休息 → 循环结束，回到 idle，计数重置为 0
    return {
      phase: "work",
      status: "idle",
      remainingSeconds: settings.workMinutes * 60,
      completedPomodoros: 0,
      startedAt: null,
      pausedAt: null,
    };
  }

  throw new StateTransitionError(
    `SKIP 不允许从 (${phase}, ${status}) 状态`,
    `${phase}_${status}`,
    "SKIP",
  );
}

/**
 * 处理 TIMER_COMPLETE 动作（倒计时归零后自动触发）。
 */
function handleTimerComplete(
  state: TimerState,
  settings: DurationConfig,
): TimerState {
  const { phase, completedPomodoros } = state;

  if (phase === "work" && completedPomodoros < 3) {
    // 工作完成，completedPomodoros < 4 → 短休息
    return {
      ...state,
      phase: "short_break",
      status: "running",
      remainingSeconds: settings.shortBreakMinutes * 60,
      completedPomodoros: completedPomodoros + 1,
      startedAt: null,
      pausedAt: null,
    };
  }

  if (phase === "work" && completedPomodoros === 3) {
    // 第 4 个番茄钟完成 → 长休息
    return {
      ...state,
      phase: "long_break",
      status: "running",
      remainingSeconds: settings.longBreakMinutes * 60,
      completedPomodoros: 4,
      startedAt: null,
      pausedAt: null,
    };
  }

  if (phase === "short_break") {
    // 短休息结束 → 进入工作
    return {
      ...state,
      phase: "work",
      status: "running",
      remainingSeconds: settings.workMinutes * 60,
      startedAt: null,
      pausedAt: null,
    };
  }

  if (phase === "long_break") {
    // 长休息结束 → 循环结束，回到 idle
    return {
      phase: "work",
      status: "idle",
      remainingSeconds: settings.workMinutes * 60,
      completedPomodoros: 0,
      startedAt: null,
      pausedAt: null,
    };
  }

  throw new StateTransitionError(
    `TIMER_COMPLETE 不允许从 phase=${phase} 状态`,
    `${phase}_running`,
    "TIMER_COMPLETE",
  );
}

/**
 * 根据当前状态和设置计算下一阶段及相关初始秒数。
 *
 * @param current - 当前计时器状态
 * @param settings - 时长配置
 * @returns 下一阶段信息和初始秒数
 */
export function getNextPhase(
  current: TimerState,
  settings: DurationConfig,
): { phase: string; initialSeconds: number } {
  const { phase, completedPomodoros } = current;

  if (phase === "work") {
    if (completedPomodoros + 1 >= 4) {
      return {
        phase: "long_break",
        initialSeconds: settings.longBreakMinutes * 60,
      };
    }
    return {
      phase: "short_break",
      initialSeconds: settings.shortBreakMinutes * 60,
    };
  }

  if (phase === "short_break" || phase === "long_break") {
    return {
      phase: "work",
      initialSeconds: settings.workMinutes * 60,
    };
  }

  return {
    phase: "work",
    initialSeconds: settings.workMinutes * 60,
  };
}
