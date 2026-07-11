/**
 * 计时引擎模块
 *
 * 基于系统时钟（Date.now() 参数注入）计算剩余秒数，
 * 非 setInterval 累减，消除长时间运行的时间漂移。
 *
 * 对外接口：
 * - createTimerEngine(config): TimerEngine
 * - engine.start(now): void
 * - engine.pause(now): void
 * - engine.resume(now): void
 * - engine.reset(): void
 * - engine.getRemainingSeconds(now): number
 * - engine.tick(now): TickResult
 */

import type { DurationConfig } from "../types/settings";
import type { TimerEngine, TickResult } from "../types/timer";

/**
 * 创建计时引擎实例。
 *
 * @param config - 时长配置（至少需包含 workMinutes）
 * @returns TimerEngine 实例
 * @throws 当 config 无效时抛出
 */
export function createTimerEngine(config: DurationConfig): TimerEngine {
  if (!config || typeof config.workMinutes !== "number") {
    throw new Error("createTimerEngine: 无效的配置参数");
  }

  const totalDuration = config.workMinutes * 60;

  // 内部状态
  let startedAt: number | null = null;
  let remainingAtPause: number | null = null;

  /**
   * 获取当前剩余秒数。
   * - 未启动时返回完整时长
   * - 暂停时返回冻结值
   * - 运行中基于 startedAt 计算
   */
  function getRemainingSeconds(now: number): number {
    if (startedAt === null && remainingAtPause === null) {
      // 引擎未启动
      return totalDuration;
    }

    if (remainingAtPause !== null) {
      // 暂停状态：返回冻结的剩余秒数
      return Math.max(0, remainingAtPause);
    }

    // 运行状态：基于系统时钟计算
    const elapsedMs = now - startedAt!;
    const elapsedSeconds = elapsedMs / 1000;
    const remaining = totalDuration - elapsedSeconds;
    return Math.max(0, Math.ceil(remaining));
  }

  /**
   * 启动计时器。
   */
  function start(now: number): void {
    startedAt = now;
    remainingAtPause = null;
  }

  /**
   * 暂停计时器。
   * 冻结当前剩余秒数。
   */
  function pause(now: number): void {
    if (startedAt !== null) {
      remainingAtPause = getRemainingSeconds(now);
    }
    // 如果引擎未启动，pause 是静默无操作
  }

  /**
   * 恢复计时器。
   * 调整 startedAt 使恢复瞬间剩余秒数不变。
   */
  function resume(now: number): void {
    if (remainingAtPause !== null) {
      // 调整 startedAt，使得 resume 后剩余秒数 = remainingAtPause
      // 公式：remainingAtPause = totalDuration - (now - adjustedStartedAt) / 1000
      // => adjustedStartedAt = now - (totalDuration - remainingAtPause) * 1000
      const alreadyElapsedMs = (totalDuration - remainingAtPause) * 1000;
      startedAt = now - alreadyElapsedMs;
      remainingAtPause = null;
    }
  }

  /**
   * 重置计时器到初始状态。
   */
  function reset(): void {
    startedAt = null;
    remainingAtPause = null;
  }

  /**
   * Tick 回调：获取剩余秒数和是否已过期。
   */
  function tick(now: number): TickResult {
    const remaining = getRemainingSeconds(now);
    return {
      remainingSeconds: remaining,
      expired: remaining <= 0,
    };
  }

  return {
    start,
    pause,
    resume,
    reset,
    getRemainingSeconds,
    tick,
  };
}
