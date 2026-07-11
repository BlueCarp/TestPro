/**
 * useKeyboard Hook 单元测试
 *
 * 测试空格/R/S/Esc 快捷键映射到 timerStore action。
 * 由于 Hook 操作 window.addEventListener，使用 @testing-library/react hooks API。
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createTimerStore, type TimerStore } from "../../stores/timerStore";
import { useKeyboard } from "../../hooks/useKeyboard";

describe("useKeyboard", () => {
  let timerStore: TimerStore;

  beforeEach(() => {
    vi.useFakeTimers();
    timerStore = createTimerStore(undefined, () => Date.now());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ==================== Space Bar ====================

  describe("space bar", () => {
    it("should start timer when status is idle", () => {
      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: " " }),
        );
      });

      const state = timerStore.getState();
      expect(state.status).toBe("running");
    });

    it("should pause timer when status is running", () => {
      const state = timerStore.getState();
      state.start();

      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: " " }),
        );
      });

      const updated = timerStore.getState();
      expect(updated.status).toBe("paused");
    });

    it("should resume timer when status is paused", () => {
      const state = timerStore.getState();
      state.start();
      state.pause();

      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: " " }),
        );
      });

      const updated = timerStore.getState();
      expect(updated.status).toBe("running");
    });

    it("should not react to space when in input element", () => {
      const input = document.createElement("input");
      document.body.appendChild(input);

      renderHook(() => useKeyboard(timerStore));

      act(() => {
        input.dispatchEvent(
          new KeyboardEvent("keydown", { key: " ", bubbles: true }),
        );
      });

      const state = timerStore.getState();
      expect(state.status).toBe("idle");

      document.body.removeChild(input);
    });
  });

  // ==================== R Key (Reset) ====================

  describe("R key", () => {
    it("should reset timer when status is paused", () => {
      const state = timerStore.getState();
      state.start();
      state.pause();

      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "r" }),
        );
      });

      const updated = timerStore.getState();
      expect(updated.status).toBe("idle");
      expect(updated.remainingSeconds).toBe(1500); // 25 * 60
    });

    it("should ignore R when status is idle", () => {
      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "r" }),
        );
      });

      const state = timerStore.getState();
      expect(state.status).toBe("idle");
    });

    it("should ignore R when status is running", () => {
      const state = timerStore.getState();
      state.start();

      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "r" }),
        );
      });

      const updated = timerStore.getState();
      expect(updated.status).toBe("running");
    });
  });

  // ==================== S Key (Skip) ====================

  describe("S key", () => {
    it("should trigger skip when status is running", () => {
      const state = timerStore.getState();
      state.start();

      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "s" }),
        );
      });

      const updated = timerStore.getState();
      expect(updated.pendingConfirm).toBe(true);
    });

    it("should trigger skip when status is paused", () => {
      const state = timerStore.getState();
      state.start();
      state.pause();

      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "S" }),
        );
      });

      const updated = timerStore.getState();
      expect(updated.pendingConfirm).toBe(true);
    });

    it("should ignore S when status is idle", () => {
      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "s" }),
        );
      });

      const state = timerStore.getState();
      expect(state.pendingConfirm).toBe(false);
    });
  });

  // ==================== Escape Key ====================

  describe("Escape key", () => {
    it("should cancel skip confirmation", () => {
      const state = timerStore.getState();
      state.start();
      state.skip();
      // Re-read state after skip (Zustand snapshot is not live)
      const afterSkip = timerStore.getState();
      expect(afterSkip.pendingConfirm).toBe(true);

      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape" }),
        );
      });

      const updated = timerStore.getState();
      expect(updated.pendingConfirm).toBe(false);
    });

    it("should call cancelSkip even when no pending confirmation", () => {
      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape" }),
        );
      });

      // Should not throw
      const state = timerStore.getState();
      expect(state.pendingConfirm).toBe(false);
    });
  });

  // ==================== Modifier Key Combinations ====================

  describe("modifier key combinations", () => {
    it("should ignore Ctrl+Space", () => {
      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: " ",
            ctrlKey: true,
          }),
        );
      });

      expect(timerStore.getState().status).toBe("idle");
    });

    it("should ignore Alt+S", () => {
      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "s",
            altKey: true,
          }),
        );
      });

      expect(timerStore.getState().pendingConfirm).toBe(false);
    });

    it("should ignore Cmd+R on Mac", () => {
      renderHook(() => useKeyboard(timerStore));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "r",
            metaKey: true,
          }),
        );
      });

      expect(timerStore.getState().status).toBe("idle");
    });
  });

  // ==================== Cleanup ====================

  describe("cleanup", () => {
    it("should remove event listener on unmount", () => {
      const { unmount } = renderHook(() => useKeyboard(timerStore));

      unmount();

      // After unmount, key events should not trigger actions
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: " " }),
        );
      });

      expect(timerStore.getState().status).toBe("idle");
    });
  });
});
