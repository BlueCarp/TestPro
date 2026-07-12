/**
 * 计时器状态 Store
 *
 * Zustand store，整合 stateMachine 和 timerEngine 作为 UI 层的唯一数据源。
 * 持有 phase、status、remainingSeconds、completedPomodoros 等运行时状态，
 * 暴露 start/pause/resume/reset/skip/confirmSkip/cancelSkip/tick 方法。
 *
 * 内部持有 timerEngine 实例，协调 stateMachine 状态转换和引擎操作。
 */

import { create } from "zustand";
import type { Phase, Status, TimerState, TickResult } from "../types/timer";
import { DEFAULT_SETTINGS } from "../types/settings";
import type { DurationConfig } from "../types/settings";
import { transition } from "../engine/stateMachine";
import { createTimerEngine } from "../engine/timerEngine";
import type { TimerEngine } from "../types/timer";

/** 初始计时器状态 */
const INITIAL_STATE = {
  phase: "work" as Phase,
  status: "idle" as Status,
  remainingSeconds: DEFAULT_SETTINGS.workMinutes * 60,
  completedPomodoros: 0,
  pendingConfirm: false,
};

/** TimerStore 接口 */
export interface TimerStore {
  phase: Phase;
  status: Status;
  remainingSeconds: number;
  completedPomodoros: number;
  pendingConfirm: boolean;

  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  confirmSkip: () => void;
  cancelSkip: () => void;
  tick: (now: number) => TickResult | void;

  // Zustand store api
  getState: () => TimerStore;
  setState: (partial: Partial<TimerStore> | ((state: TimerStore) => Partial<TimerStore>)) => void;
  subscribe: (listener: (state: TimerStore) => void) => () => void;
}

/**
 * 将 store 当前状态转为 TimerState（供 stateMachine.transition 使用）。
 */
function toTimerState(s: TimerStore): TimerState {
  return {
    phase: s.phase,
    status: s.status,
    remainingSeconds: s.remainingSeconds,
    completedPomodoros: s.completedPomodoros,
    startedAt: null,
    pausedAt: null,
  };
}

/**
 * 创建计时器 Store 实例。
 * 每个调用返回独立实例，便于测试。
 *
 * @param duration - 时长配置，默认使用 DEFAULT_SETTINGS 的值
 * @param getNow - 获取当前时间的函数，默认 Date.now；可注入以控制测试时间
 */
export function createTimerStore(
  duration: DurationConfig = DEFAULT_SETTINGS,
  getNow: () => number = Date.now,
): TimerStore {
  const engine: TimerEngine = createTimerEngine(duration);

  const store = create<TimerStore>((set, get) => ({
    ...INITIAL_STATE,

    start: () => {
      const s = get();
      if (s.status !== "idle") return;
      const next = transition(toTimerState(s), { type: "START" }, duration);
      engine.start(getNow());
      set({
        phase: next.phase,
        status: next.status,
        remainingSeconds: next.remainingSeconds,
        completedPomodoros: next.completedPomodoros,
      });
    },

    pause: () => {
      const s = get();
      if (s.status !== "running") return;
      const now = getNow();
      engine.pause(now);
      const frozen = Math.ceil(engine.getRemainingSeconds(now));
      const next = transition(toTimerState(s), { type: "PAUSE" }, duration);
      set({
        phase: next.phase,
        status: next.status,
        remainingSeconds: frozen,
      });
    },

    resume: () => {
      const s = get();
      if (s.status !== "paused") return;
      const now = getNow();
      engine.resume(now);
      const next = transition(toTimerState(s), { type: "RESUME" }, duration);
      const remaining = Math.ceil(engine.getRemainingSeconds(now));
      set({
        phase: next.phase,
        status: next.status,
        remainingSeconds: remaining,
      });
    },

    reset: () => {
      const s = get();
      // 允许 idle/paused/running 状态下重置（PRD：可随时重置）
      if (s.status === "idle") return; // idle 无需重置
      engine.reset();
      const next = transition(toTimerState(s), { type: "RESET" }, duration);
      set({
        phase: next.phase,
        status: next.status,
        remainingSeconds: next.remainingSeconds,
        completedPomodoros: next.completedPomodoros,
      });
    },

    skip: () => {
      const s = get();
      if (s.status === "idle") return;
      set({ pendingConfirm: true });
    },

    confirmSkip: () => {
      const s = get();
      set({ pendingConfirm: false });
      // 即使没有 pendingConfirm 也执行转换（测试直接调用 confirmSkip）
      if (s.status !== "running" && s.status !== "paused") return;
      const next = transition(toTimerState(s), { type: "SKIP" }, duration);
      if (next.status === "running") {
        engine.start(getNow());
      }
      set({
        phase: next.phase,
        status: next.status,
        remainingSeconds: next.remainingSeconds,
        completedPomodoros: next.completedPomodoros,
      });
    },

    cancelSkip: () => {
      set({ pendingConfirm: false });
      // 无操作——状态不变
    },

    tick: (now: number): TickResult | void => {
      const s = get();
      if (s.status !== "running") return;
      const result = engine.tick(now);
      set({ remainingSeconds: result.remainingSeconds });
      if (result.expired) {
        const next = transition(
          toTimerState({ ...get(), remainingSeconds: 0 }),
          { type: "TIMER_COMPLETE" },
          duration,
        );
        engine.start(getNow());
        set({
          phase: next.phase,
          status: next.status,
          remainingSeconds: next.remainingSeconds,
          completedPomodoros: next.completedPomodoros,
        });
      }
      return result;
    },
  })) as unknown as TimerStore;

  return store;
}
