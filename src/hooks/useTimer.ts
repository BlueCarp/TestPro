/**
 * useTimer Hook
 *
 * 管理计时器 tick 循环（250ms 间隔），在 remainingSeconds 归零时自动触发
 * TIMER_COMPLETE 转换并调用通知。组件卸载时清理 interval，防止内存泄漏。
 *
 * 职责：
 * - 启动/停止 tick 循环（依赖 status === "running"）
 * - 每次 tick 调用 timerStore.tick(now) 更新 UI 状态
 * - 归零时触发 notification.notifyPhaseEnd
 * - 组件卸载时清理 interval
 */

import { useEffect, useRef, useCallback } from "react";
import { type TimerStore } from "../stores/timerStore";
import { useNotification } from "./useNotification";
import type { Phase } from "../types/timer";

// Tick 间隔 250ms，避免 WebView 后台节流导致的显示跳跃
const TICK_INTERVAL_MS = 250;

/**
 * 创建 useTimer 所需的依赖对象。
 * 生产环境传入真实的 timerStore 和 phase 变更回调。
 * 测试环境可注入 mock。
 */
export interface UseTimerDeps {
  timerStore: TimerStore;
  /** phase 变更时的副作用回调（用于触发通知等） */
  onPhaseChange?: (from: Phase, to: Phase) => void;
}

/**
 * useTimer Hook。
 *
 * 管理计时器的 tick 循环：当 status 为 running 时启动 250ms 间隔，
 * 每次触发时调用 timerStore.tick(now) 更新 remainingSeconds，
 * 并在归零时自动触发通知。
 *
 * @param deps - 依赖注入（timerStore 必需）
 * @returns 当前 store 状态引用（供组件消费）
 */
export function useTimer(deps: UseTimerDeps): TimerStore {
  const { timerStore, onPhaseChange } = deps;
  const { notifyPhaseEnd } = useNotification();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPhaseRef = useRef<Phase | null>(null);
  // P1-3: 跟踪本次 tick 是否已通知，防止重复触发
  const notifiedRef = useRef<Set<string>>(new Set());

  // 记录初始 phase，方便首次比较
  prevPhaseRef.current = timerStore.getState().phase;

  /** 清理 tick 循环 */
  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /** 启动 tick 循环 */
  const startTick = useCallback(() => {
    if (intervalRef.current !== null) return; // 已在运行

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const state = timerStore.getState();
      const result = state.tick(now);

      if (result) {
        const currentPhase = state.phase;

        // 检测 phase 变更（用于触发通知）
        const prevPhase = prevPhaseRef.current;
        if (prevPhase && prevPhase !== currentPhase) {
          onPhaseChange?.(prevPhase, currentPhase);
          prevPhaseRef.current = currentPhase;
        }

        // 归零时触发通知（P1-3: 去重）
        if (result.expired) {
          const notifKey = `phase:${currentPhase}`;
          if (!notifiedRef.current.has(notifKey)) {
            notifiedRef.current.add(notifKey);
            notifyPhaseEnd(prevPhase ?? currentPhase);
          }
        }
      }
    }, TICK_INTERVAL_MS);
  }, [timerStore, onPhaseChange, notifyPhaseEnd]);

  useEffect(() => {
    const state = timerStore.getState();
    const isRunning = state.status === "running";

    if (isRunning) {
      startTick();
    }

    // 订阅状态变化——status 变为 running 时启动 tick
    const unsubscribe = timerStore.subscribe((newState) => {
      if (newState.status === "running" && intervalRef.current === null) {
        startTick();
      } else if (newState.status !== "running" && intervalRef.current !== null) {
        clearTick();
      }

      // 检测 phase 变更
      const prev = prevPhaseRef.current;
      if (prev && prev !== newState.phase) {
        onPhaseChange?.(prev, newState.phase);
        prevPhaseRef.current = newState.phase;
        // P1-3: phase 变更后清除去重标记，允许新阶段的通知
        notifiedRef.current.clear();
      }
    });

    return () => {
      unsubscribe();
      clearTick();
    };
  }, [timerStore, startTick, clearTick, onPhaseChange]);

  return timerStore;
}
