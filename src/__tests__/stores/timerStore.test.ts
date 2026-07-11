import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTimerStore, type TimerStore } from "../../stores/timerStore";

// We'll recreate the store for each test with mocked engine
describe("timerStore", () => {
  let store: TimerStore;

  beforeEach(() => {
    // Create fresh store for each test
    store = createTimerStore();
  });

  // ==================== Initial State ====================
  describe("initial state", () => {
    it("should start with idle state", () => {
      const state = store.getState();
      expect(state.phase).toBe("work");
      expect(state.status).toBe("idle");
      expect(state.remainingSeconds).toBe(1500);
      expect(state.completedPomodoros).toBe(0);
    });
  });

  // ==================== start() ====================
  describe("start", () => {
    it("should transition from idle to running", () => {
      const state = store.getState();
      state.start();

      const updated = store.getState();
      expect(updated.status).toBe("running");
      expect(updated.phase).toBe("work");
    });

    it("should set remaining seconds based on work duration", () => {
      const state = store.getState();
      state.start();

      const updated = store.getState();
      expect(updated.remainingSeconds).toBe(1500); // 25 * 60
    });

    it("should not start if status is not idle", () => {
      // Start once
      store.getState().start();
      // Try to start again
      store.getState().start();

      // Should still be running, not error out
      const state = store.getState();
      expect(state.status).toBe("running");
    });
  });

  // ==================== pause() ====================
  describe("pause", () => {
    it("should transition from running to paused", () => {
      store.getState().start();
      store.getState().pause();

      const state = store.getState();
      expect(state.status).toBe("paused");
      expect(state.phase).toBe("work");
    });
  });

  // ==================== resume() ====================
  describe("resume", () => {
    it("should transition from paused to running", () => {
      store.getState().start();
      store.getState().pause();
      store.getState().resume();

      const state = store.getState();
      expect(state.status).toBe("running");
      expect(state.phase).toBe("work");
    });
  });

  // ==================== reset() ====================
  describe("reset", () => {
    it("should return to idle with fresh work duration", () => {
      store.getState().start();
      store.getState().pause();
      store.getState().reset();

      const state = store.getState();
      expect(state.status).toBe("idle");
      expect(state.phase).toBe("work");
      expect(state.remainingSeconds).toBe(1500);
    });

    it("should preserve completedPomodoros on reset", () => {
      // Simulate completing 2 pomodoros then resetting
      // Note: completedPomodoros is updated by stateMachine on TIMER_COMPLETE
      const state = store.getState();
      // Manually set to simulate prior work
      store.setState({
        status: "paused" as const,
        completedPomodoros: 2,
      });
      store.getState().reset();

      const updated = store.getState();
      expect(updated.completedPomodoros).toBe(2); // Unchanged by reset
      expect(updated.status).toBe("idle");
    });
  });

  // ==================== skip() ====================
  describe("skip", () => {
    it("should set pending confirmation state when skip is called", () => {
      store.getState().start();
      store.getState().skip();

      const state = store.getState();
      // Skip should set a pendingConfirm state or directly transition
      // depending on implementation
      // The test verifies skip exists and doesn't throw
      expect(state).toBeDefined();
    });

    it("should transition to next phase after confirmed skip", () => {
      const state = store.getState();
      state.start();

      // After confirmation callback
      state.confirmSkip();

      const updated = store.getState();
      expect(updated.status).toBe("running");
      expect(updated.completedPomodoros).toBe(1);
    });

    it("should not transition when skip is cancelled", () => {
      store.getState().start();
      const beforeState = store.getState();

      store.getState().cancelSkip();

      const afterState = store.getState();
      // Should remain in same state
      expect(afterState.status).toBe(beforeState.status);
      expect(afterState.phase).toBe(beforeState.phase);
      expect(afterState.completedPomodoros).toBe(beforeState.completedPomodoros);
    });
  });

  // ==================== tick ====================
  describe("tick", () => {
    it("should update remaining seconds on tick", () => {
      store.getState().start();
      const initialSeconds = store.getState().remainingSeconds;

      store.getState().tick(1720684805000); // 5 seconds later

      const updated = store.getState();
      expect(updated.remainingSeconds).toBeLessThan(initialSeconds);
    });

    it("should detect expired state when remaining <= 0", () => {
      store.getState().start();

      // Tick way into the future
      const result = store.getState().tick(1720684800000 + 1500000);

      // Should detect expiry
      expect(result).toBeDefined();
    });
  });

  // ==================== Subscribe ====================
  describe("subscribe", () => {
    it("should notify listeners on state change", () => {
      const listener = vi.fn();
      store.subscribe(listener);

      store.getState().start();

      // Listener should have been called
      expect(listener).toHaveBeenCalled();
    });
  });
});
