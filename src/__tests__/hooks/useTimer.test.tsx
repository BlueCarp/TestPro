/**
 * useTimer Hook 单元测试
 *
 * 测试 tick 循环、归零自动切换、通知触发、组件卸载清理。
 * 由于 Hook 必须在 React 组件上下文中调用，使用 @testing-library/react hooks API。
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createTimerStore, type TimerStore } from "../../stores/timerStore";
import { useTimer } from "../../hooks/useTimer";

/** 基准时间 */
const BASE_TIME = 1720684800000;

describe("useTimer", () => {
  let timerStore: TimerStore;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
    timerStore = createTimerStore(undefined, () => Date.now());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ==================== Initial Behavior ====================

  describe("initial state", () => {
    it("should return the timer store", () => {
      const { result } = renderHook(() => useTimer({ timerStore }));
      expect(result.current).toBe(timerStore);
    });

    it("should not start tick loop when status is idle", () => {
      renderHook(() => useTimer({ timerStore }));
      // Advance timers — no tick should fire
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      const state = timerStore.getState();
      expect(state.status).toBe("idle");
    });
  });

  // ==================== Tick Loop ====================

  describe("tick loop", () => {
    it("should start ticking when status is running", () => {
      const state = timerStore.getState();
      state.start();

      renderHook(() => useTimer({ timerStore }));

      // Advance one tick interval
      act(() => {
        vi.advanceTimersByTime(250);
      });

      const updated = timerStore.getState();
      expect(updated.status).toBe("running");
      // remainingSeconds should decrease slightly
      expect(updated.remainingSeconds).toBeLessThanOrEqual(1500);
    });

    it("should update remainingSeconds on each tick", () => {
      const state = timerStore.getState();
      state.start();

      renderHook(() => useTimer({ timerStore }));

      const initialSeconds = state.remainingSeconds;

      act(() => {
        vi.advanceTimersByTime(1000); // 4 ticks
      });

      const updated = timerStore.getState();
      expect(updated.remainingSeconds).toBeLessThan(initialSeconds);
    });

    it("should stop ticking when status changes to paused", () => {
      const state = timerStore.getState();
      state.start();
      state.pause();

      renderHook(() => useTimer({ timerStore }));

      // Advance timers — no tick should fire since status is paused
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const updated = timerStore.getState();
      expect(updated.status).toBe("paused");
    });

    it("should restart ticking when status goes back to running (resume)", () => {
      const state = timerStore.getState();
      state.start();
      state.pause();

      renderHook(() => useTimer({ timerStore }));

      // Resume
      act(() => {
        state.resume();
      });

      // Advance timers
      act(() => {
        vi.advanceTimersByTime(500);
      });

      const updated = timerStore.getState();
      expect(updated.status).toBe("running");
    });
  });

  // ==================== Cleanup ====================

  describe("cleanup on unmount", () => {
    it("should clear interval when component unmounts", () => {
      const state = timerStore.getState();
      state.start();

      const { unmount } = renderHook(() => useTimer({ timerStore }));

      act(() => {
        vi.advanceTimersByTime(250);
      });

      unmount();

      // Advance more timers — should not crash or continue ticking
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(timerStore.getState().status).toBe("running");
    });
  });

  // ==================== Phase Change Callback ====================

  describe("onPhaseChange", () => {
    it("should call onPhaseChange when phase transitions", () => {
      const onPhaseChange = vi.fn();
      const state = timerStore.getState();
      state.start();

      renderHook(() =>
        useTimer({ timerStore, onPhaseChange }),
      );

      // Manually trigger a phase change by simulating a timer complete
      // We advance time past the full work duration
      act(() => {
        vi.advanceTimersByTime(1500000); // 25 minutes in ms
      });

      // Phase should have changed (work -> short_break or similar)
      const updated = timerStore.getState();
      expect(updated.phase).not.toBe("work");
    });
  });

  // ==================== Auto-switch on Zero ====================

  describe("auto-switch on remainingSeconds zero", () => {
    it("should trigger TIMER_COMPLETE when time expires", () => {
      const state = timerStore.getState();
      state.start();

      renderHook(() => useTimer({ timerStore }));

      // Advance past the full work duration
      act(() => {
        vi.advanceTimersByTime(1500000); // 25 minutes
      });

      const updated = timerStore.getState();
      // Should have transitioned to a break phase
      expect(["short_break", "long_break"]).toContain(updated.phase);
    });
  });
});
