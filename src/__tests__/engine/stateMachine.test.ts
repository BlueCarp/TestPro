import { describe, it, expect } from "vitest";
import { transition } from "../../engine/stateMachine";
import type { TimerState, TimerAction } from "../../types/timer";
import type { DurationConfig } from "../../types/settings";

// Default settings for tests
const defaultSettings: DurationConfig = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
};

// Helper to create initial idle state
function idleState(): TimerState {
  return {
    phase: "work",
    status: "idle",
    remainingSeconds: 1500,
    completedPomodoros: 0,
    startedAt: null,
    pausedAt: null,
  };
}

// Helper to create running_work state
function runningWorkState(completedPomodoros = 0, remainingSeconds = 1500): TimerState {
  return {
    phase: "work",
    status: "running",
    remainingSeconds,
    completedPomodoros,
    startedAt: 1720684800000,
    pausedAt: null,
  };
}

// Helper to create paused_work state
function pausedWorkState(completedPomodoros = 0, remainingSeconds = 1200): TimerState {
  return {
    phase: "work",
    status: "paused",
    remainingSeconds,
    completedPomodoros,
    startedAt: 1720684800000,
    pausedAt: 1720684830000,
  };
}

// Helper to create running_short_break state
function runningShortBreakState(completedPomodoros = 1, remainingSeconds = 300): TimerState {
  return {
    phase: "short_break",
    status: "running",
    remainingSeconds,
    completedPomodoros,
    startedAt: 1720684800000,
    pausedAt: null,
  };
}

// Helper to create paused_short_break state
function pausedShortBreakState(completedPomodoros = 1, remainingSeconds = 200): TimerState {
  return {
    phase: "short_break",
    status: "paused",
    remainingSeconds,
    completedPomodoros,
    startedAt: 1720684800000,
    pausedAt: 1720684880000,
  };
}

// Helper to create running_long_break state
function runningLongBreakState(remainingSeconds = 900): TimerState {
  return {
    phase: "long_break",
    status: "running",
    remainingSeconds,
    completedPomodoros: 4,
    startedAt: 1720684800000,
    pausedAt: null,
  };
}

// Helper to create paused_long_break state
function pausedLongBreakState(remainingSeconds = 800): TimerState {
  return {
    phase: "long_break",
    status: "paused",
    remainingSeconds,
    completedPomodoros: 4,
    startedAt: 1720684800000,
    pausedAt: 1720684880000,
  };
}

describe("stateMachine - transition", () => {
  // ================================================================
  // Valid Transitions — From idle
  // ================================================================
  describe("from idle", () => {
    it("should transition from idle to running_work on START", () => {
      const result = transition(idleState(), { type: "START" }, defaultSettings);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("running");
      expect(result.remainingSeconds).toBe(1500); // 25 * 60
      expect(result.completedPomodoros).toBe(0);
    });
  });

  // ================================================================
  // Valid Transitions — From running_work
  // ================================================================
  describe("from running_work", () => {
    it("should transition to paused_work on PAUSE", () => {
      const state = runningWorkState(0, 1400);
      const result = transition(state, { type: "PAUSE" }, defaultSettings);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("paused");
    });

    it("should transition to running_short_break on TIMER_COMPLETE when completedPomodoros < 3", () => {
      const state = runningWorkState(2, 0);
      const result = transition(state, { type: "TIMER_COMPLETE" }, defaultSettings);
      expect(result.phase).toBe("short_break");
      expect(result.status).toBe("running");
      expect(result.completedPomodoros).toBe(3);
      expect(result.remainingSeconds).toBe(300); // 5 * 60
    });

    it("should transition to running_long_break on TIMER_COMPLETE when completedPomodoros == 3", () => {
      const state = runningWorkState(3, 0);
      const result = transition(state, { type: "TIMER_COMPLETE" }, defaultSettings);
      expect(result.phase).toBe("long_break");
      expect(result.status).toBe("running");
      expect(result.completedPomodoros).toBe(4);
      expect(result.remainingSeconds).toBe(900); // 15 * 60
    });

    it("should transition to running_short_break on SKIP when completedPomodoros < 3", () => {
      const state = runningWorkState(1, 1000);
      const result = transition(state, { type: "SKIP" }, defaultSettings);
      expect(result.phase).toBe("short_break");
      expect(result.status).toBe("running");
      expect(result.completedPomodoros).toBe(2);
      expect(result.remainingSeconds).toBe(300); // 5 * 60
    });

    it("should transition to running_long_break on SKIP when completedPomodoros == 3", () => {
      const state = runningWorkState(3, 1500);
      const result = transition(state, { type: "SKIP" }, defaultSettings);
      expect(result.phase).toBe("long_break");
      expect(result.status).toBe("running");
      expect(result.completedPomodoros).toBe(4);
      expect(result.remainingSeconds).toBe(900); // 15 * 60
    });
  });

  // ================================================================
  // Valid Transitions — From paused_work
  // ================================================================
  describe("from paused_work", () => {
    it("should transition to running_work on RESUME", () => {
      const state = pausedWorkState(1, 800);
      const result = transition(state, { type: "RESUME" }, defaultSettings);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("running");
      expect(result.remainingSeconds).toBe(800);
    });

    it("should transition to idle on RESET", () => {
      const state = pausedWorkState(2, 600);
      const result = transition(state, { type: "RESET" }, defaultSettings);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("idle");
      expect(result.remainingSeconds).toBe(1500); // Back to 25:00
      expect(result.completedPomodoros).toBe(2); // Count unchanged
    });

    it("should transition to running_short_break on SKIP when completedPomodoros < 3", () => {
      const state = pausedWorkState(0, 1000);
      const result = transition(state, { type: "SKIP" }, defaultSettings);
      expect(result.phase).toBe("short_break");
      expect(result.status).toBe("running");
      expect(result.completedPomodoros).toBe(1);
      expect(result.remainingSeconds).toBe(300);
    });

    it("should transition to running_long_break on SKIP when completedPomodoros == 3", () => {
      const state = pausedWorkState(3, 1400);
      const result = transition(state, { type: "SKIP" }, defaultSettings);
      expect(result.phase).toBe("long_break");
      expect(result.status).toBe("running");
      expect(result.completedPomodoros).toBe(4);
      expect(result.remainingSeconds).toBe(900);
    });
  });

  // ================================================================
  // Valid Transitions — From running_short_break
  // ================================================================
  describe("from running_short_break", () => {
    it("should transition to paused_short_break on PAUSE", () => {
      const state = runningShortBreakState(2, 250);
      const result = transition(state, { type: "PAUSE" }, defaultSettings);
      expect(result.phase).toBe("short_break");
      expect(result.status).toBe("paused");
    });

    it("should transition to running_work on TIMER_COMPLETE", () => {
      const state = runningShortBreakState(3, 0);
      const result = transition(state, { type: "TIMER_COMPLETE" }, defaultSettings);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("running");
      expect(result.completedPomodoros).toBe(3); // Count unchanged
      expect(result.remainingSeconds).toBe(1500); // 25 * 60
    });

    it("should transition to running_work on SKIP", () => {
      const state = runningShortBreakState(2, 200);
      const result = transition(state, { type: "SKIP" }, defaultSettings);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("running");
      expect(result.completedPomodoros).toBe(2); // Count unchanged
      expect(result.remainingSeconds).toBe(1500);
    });
  });

  // ================================================================
  // Valid Transitions — From paused_short_break
  // ================================================================
  describe("from paused_short_break", () => {
    it("should transition to running_short_break on RESUME", () => {
      const state = pausedShortBreakState(1, 150);
      const result = transition(state, { type: "RESUME" }, defaultSettings);
      expect(result.phase).toBe("short_break");
      expect(result.status).toBe("running");
      expect(result.remainingSeconds).toBe(150);
    });

    it("should transition to idle on RESET", () => {
      const state = pausedShortBreakState(2, 100);
      const result = transition(state, { type: "RESET" }, defaultSettings);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("idle");
      expect(result.remainingSeconds).toBe(1500);
      expect(result.completedPomodoros).toBe(2); // Count unchanged
    });

    it("should transition to running_work on SKIP", () => {
      const state = pausedShortBreakState(1, 200);
      const result = transition(state, { type: "SKIP" }, defaultSettings);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("running");
      expect(result.completedPomodoros).toBe(1);
      expect(result.remainingSeconds).toBe(1500);
    });
  });

  // ================================================================
  // Valid Transitions — From running_long_break
  // ================================================================
  describe("from running_long_break", () => {
    it("should transition to paused_long_break on PAUSE", () => {
      const state = runningLongBreakState(500);
      const result = transition(state, { type: "PAUSE" }, defaultSettings);
      expect(result.phase).toBe("long_break");
      expect(result.status).toBe("paused");
    });

    it("should transition to idle on TIMER_COMPLETE", () => {
      const state = runningLongBreakState(0);
      const result = transition(state, { type: "TIMER_COMPLETE" }, defaultSettings);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("idle");
      expect(result.completedPomodoros).toBe(0); // Reset to 0
      expect(result.remainingSeconds).toBe(1500); // Back to 25:00
    });

    it("should transition to idle on SKIP", () => {
      const state = runningLongBreakState(600);
      const result = transition(state, { type: "SKIP" }, defaultSettings);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("idle");
      expect(result.completedPomodoros).toBe(0); // Reset to 0
      expect(result.remainingSeconds).toBe(1500);
    });
  });

  // ================================================================
  // Valid Transitions — From paused_long_break
  // ================================================================
  describe("from paused_long_break", () => {
    it("should transition to running_long_break on RESUME", () => {
      const state = pausedLongBreakState(400);
      const result = transition(state, { type: "RESUME" }, defaultSettings);
      expect(result.phase).toBe("long_break");
      expect(result.status).toBe("running");
      expect(result.remainingSeconds).toBe(400);
    });

    it("should transition to idle on RESET", () => {
      const state = pausedLongBreakState(300);
      const result = transition(state, { type: "RESET" }, defaultSettings);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("idle");
      expect(result.completedPomodoros).toBe(0); // Reset to 0
      expect(result.remainingSeconds).toBe(1500);
    });

    it("should transition to idle on SKIP", () => {
      const state = pausedLongBreakState(500);
      const result = transition(state, { type: "SKIP" }, defaultSettings);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("idle");
      expect(result.completedPomodoros).toBe(0);
      expect(result.remainingSeconds).toBe(1500);
    });
  });

  // ================================================================
  // Forbidden Transitions
  // ================================================================
  describe("forbidden transitions", () => {
    it("should reject PAUSE from idle", () => {
      expect(() => transition(idleState(), { type: "PAUSE" }, defaultSettings)).toThrow();
    });

    it("should reject RESUME from idle", () => {
      expect(() => transition(idleState(), { type: "RESUME" }, defaultSettings)).toThrow();
    });

    it("should reject RESET from idle", () => {
      expect(() => transition(idleState(), { type: "RESET" }, defaultSettings)).toThrow();
    });

    it("should reject SKIP from idle", () => {
      expect(() => transition(idleState(), { type: "SKIP" }, defaultSettings)).toThrow();
    });

    it("should reject RESUME from running_work", () => {
      const state = runningWorkState();
      expect(() => transition(state, { type: "RESUME" }, defaultSettings)).toThrow();
    });

    it("should reject START from running_work", () => {
      const state = runningWorkState();
      expect(() => transition(state, { type: "START" }, defaultSettings)).toThrow();
    });

    it("should reject START from paused_work", () => {
      const state = pausedWorkState();
      expect(() => transition(state, { type: "START" }, defaultSettings)).toThrow();
    });

    it("should reject PAUSE from paused_work", () => {
      const state = pausedWorkState();
      expect(() => transition(state, { type: "PAUSE" }, defaultSettings)).toThrow();
    });

    it("should reject START from running_short_break", () => {
      const state = runningShortBreakState();
      expect(() => transition(state, { type: "START" }, defaultSettings)).toThrow();
    });

    it("should reject START from running_long_break", () => {
      const state = runningLongBreakState();
      expect(() => transition(state, { type: "START" }, defaultSettings)).toThrow();
    });

    it("should throw StateTransitionError with a descriptive message", () => {
      expect(() => transition(idleState(), { type: "PAUSE" }, defaultSettings)).toThrow(
        /idle|PAUSE|forbidden|invalid|not allowed/i
      );
    });
  });

  // ================================================================
  // Pomodoro Counting Lifecycle
  // ================================================================
  describe("pomodoro counting lifecycle", () => {
    it("should count: 0→1 after first work completion", () => {
      const state = runningWorkState(0, 0);
      const result = transition(state, { type: "TIMER_COMPLETE" }, defaultSettings);
      expect(result.completedPomodoros).toBe(1);
      expect(result.phase).toBe("short_break");
    });

    it("should count: 1→2 after second work completion", () => {
      const state = runningWorkState(1, 0);
      const result = transition(state, { type: "TIMER_COMPLETE" }, defaultSettings);
      expect(result.completedPomodoros).toBe(2);
      expect(result.phase).toBe("short_break");
    });

    it("should count: 2→3 after third work completion", () => {
      const state = runningWorkState(2, 0);
      const result = transition(state, { type: "TIMER_COMPLETE" }, defaultSettings);
      expect(result.completedPomodoros).toBe(3);
      expect(result.phase).toBe("short_break");
    });

    it("should count: 3→4 and trigger long_break after fourth work completion", () => {
      const state = runningWorkState(3, 0);
      const result = transition(state, { type: "TIMER_COMPLETE" }, defaultSettings);
      expect(result.completedPomodoros).toBe(4);
      expect(result.phase).toBe("long_break");
    });

    it("should reset count to 0 after long break completes", () => {
      const state = runningLongBreakState(0);
      const result = transition(state, { type: "TIMER_COMPLETE" }, defaultSettings);
      expect(result.completedPomodoros).toBe(0);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("idle");
    });

    it("should reset count to 0 when skipping long break", () => {
      const state = runningLongBreakState(500);
      const result = transition(state, { type: "SKIP" }, defaultSettings);
      expect(result.completedPomodoros).toBe(0);
      expect(result.phase).toBe("work");
      expect(result.status).toBe("idle");
    });

    it("should keep count unchanged when resetting from paused_work", () => {
      const state = pausedWorkState(2, 800);
      const result = transition(state, { type: "RESET" }, defaultSettings);
      expect(result.completedPomodoros).toBe(2); // Unchanged
    });

    it("should keep count unchanged on short break TIMER_COMPLETE", () => {
      const state = runningShortBreakState(2, 0);
      const result = transition(state, { type: "TIMER_COMPLETE" }, defaultSettings);
      expect(result.completedPomodoros).toBe(2); // Unchanged
    });

    it("should keep count unchanged on short break SKIP", () => {
      const state = runningShortBreakState(1, 100);
      const result = transition(state, { type: "SKIP" }, defaultSettings);
      expect(result.completedPomodoros).toBe(1); // Unchanged
    });
  });

  // ================================================================
  // Custom Settings
  // ================================================================
  describe("custom settings", () => {
    it("should use custom work duration when transitioning from idle to running", () => {
      const customSettings: DurationConfig = {
        workMinutes: 45,
        shortBreakMinutes: 10,
        longBreakMinutes: 20,
      };
      const result = transition(idleState(), { type: "START" }, customSettings);
      expect(result.remainingSeconds).toBe(2700); // 45 * 60
    });

    it("should use custom break durations on TIMER_COMPLETE", () => {
      const customSettings: DurationConfig = {
        workMinutes: 30,
        shortBreakMinutes: 10,
        longBreakMinutes: 20,
      };
      const state = runningWorkState(1, 0);
      const result = transition(state, { type: "TIMER_COMPLETE" }, customSettings);
      expect(result.remainingSeconds).toBe(600); // 10 * 60
    });

    it("should use custom long break duration when completedPomodoros == 3", () => {
      const customSettings: DurationConfig = {
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 30,
      };
      const state = runningWorkState(3, 0);
      const result = transition(state, { type: "TIMER_COMPLETE" }, customSettings);
      expect(result.remainingSeconds).toBe(1800); // 30 * 60
    });

    it("should use custom work duration on RESET", () => {
      const customSettings: DurationConfig = {
        workMinutes: 50,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      };
      const state = pausedWorkState(1, 500);
      const result = transition(state, { type: "RESET" }, customSettings);
      expect(result.remainingSeconds).toBe(3000); // 50 * 60
    });
  });

  // ================================================================
  // Error Handling
  // ================================================================
  describe("error handling", () => {
    it("should throw StateTransitionError for unknown/invalid action type", () => {
      expect(() =>
        transition(idleState(), { type: "INVALID_ACTION" as any }, defaultSettings)
      ).toThrow();
    });

    it("should throw when transition is not defined", () => {
      // START from running_short_break is not a valid transition
      const state = runningShortBreakState();
      expect(() => transition(state, { type: "START" }, defaultSettings)).toThrow();
    });

    it("should preserve remainingSeconds on RESUME transitions", () => {
      const state = pausedWorkState(1, 777);
      const result = transition(state, { type: "RESUME" }, defaultSettings);
      expect(result.remainingSeconds).toBe(777);
    });
  });
});
