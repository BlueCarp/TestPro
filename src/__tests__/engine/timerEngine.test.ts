import { describe, it, expect, beforeEach } from "vitest";
import { createTimerEngine } from "../../engine/timerEngine";
import type { DurationConfig } from "../../types/settings";

const defaultSettings: DurationConfig = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
};

describe("timerEngine", () => {
  // ==================== Initial State ====================
  describe("createTimerEngine", () => {
    it("should create an engine with start/pause/resume/reset/tick/getRemainingSeconds methods", () => {
      const engine = createTimerEngine(defaultSettings);
      expect(engine).toHaveProperty("start");
      expect(engine).toHaveProperty("pause");
      expect(engine).toHaveProperty("resume");
      expect(engine).toHaveProperty("reset");
      expect(engine).toHaveProperty("tick");
      expect(engine).toHaveProperty("getRemainingSeconds");
      expect(typeof engine.start).toBe("function");
      expect(typeof engine.pause).toBe("function");
      expect(typeof engine.resume).toBe("function");
      expect(typeof engine.reset).toBe("function");
      expect(typeof engine.tick).toBe("function");
      expect(typeof engine.getRemainingSeconds).toBe("function");
    });

    it("should throw if config is invalid or missing", () => {
      expect(() => createTimerEngine(null as any)).toThrow();
      expect(() => createTimerEngine(undefined as any)).toThrow();
    });
  });

  // ==================== Start ====================
  describe("start", () => {
    it("should record startedAt on start", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);
      expect(engine.getRemainingSeconds(now)).toBe(1500); // 25 * 60
    });

    it("should have correct remaining seconds after some time passes", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);

      // 1 second later
      const later = now + 1000;
      expect(engine.getRemainingSeconds(later)).toBe(1499);
    });

    it("should reflect elapsed time accurately (multiple seconds)", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);

      // 30 seconds later
      const later = now + 30000;
      expect(engine.getRemainingSeconds(later)).toBe(1470); // 1500 - 30
    });

    it("should handle being called again (restart)", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);

      // Some time passes
      engine.start(now + 10000); // restart
      expect(engine.getRemainingSeconds(now + 10000)).toBe(1500);
    });
  });

  // ==================== Tick ====================
  describe("tick", () => {
    it("should return remaining seconds and expired=false when time remains", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);
      const result = engine.tick(now + 5000); // 5 seconds later
      expect(result.remainingSeconds).toBe(1495);
      expect(result.expired).toBe(false);
    });

    it("should return 0 and expired=true when time is exactly up", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);
      const result = engine.tick(now + 1500000); // 1500 seconds later
      expect(result.remainingSeconds).toBe(0);
      expect(result.expired).toBe(true);
    });

    it("should return 0 and expired=true when time has passed (remaining < 0)", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);
      const result = engine.tick(now + 1505000); // 1505 seconds later
      expect(result.remainingSeconds).toBe(0);
      expect(result.expired).toBe(true);
    });

    it("should handle tick before start gracefully", () => {
      const engine = createTimerEngine(defaultSettings);
      const result = engine.tick(1720684800000);
      // When clock never started, current duration = 0
      expect(typeof result.remainingSeconds).toBe("number");
      expect(typeof result.expired).toBe("boolean");
    });
  });

  // ==================== Pause / Resume ====================
  describe("pause and resume", () => {
    it("should freeze remaining seconds on pause", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);

      // 10 seconds pass
      engine.pause(now + 10000);
      const pausedRemaining = engine.getRemainingSeconds(now + 10000);
      expect(pausedRemaining).toBe(1490);

      // Time passes but remaining stays frozen
      const stillPaused = engine.getRemainingSeconds(now + 20000);
      expect(stillPaused).toBe(1490);
    });

    it("should resume from remaining seconds accurately", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);

      // Work for 60 seconds
      engine.pause(now + 60000);
      const pausedAt = now + 60000;
      const pausedRemaining = engine.getRemainingSeconds(pausedAt);
      expect(pausedRemaining).toBe(1440); // 1500 - 60

      // Resume after 5 second pause
      const resumeAt = pausedAt + 5000;
      engine.resume(resumeAt);

      // 10 more seconds of work
      const later = resumeAt + 10000;
      expect(engine.getRemainingSeconds(later)).toBe(1430); // 1440 - 10
    });

    it("should support multiple pause/resume cycles", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);

      // Cycle 1: work 30s, pause 10s
      engine.pause(now + 30000);
      engine.resume(now + 40000);

      // Cycle 2: work 20s, pause 5s
      engine.pause(now + 60000);
      engine.resume(now + 65000);

      // Work 10 more seconds
      const result = engine.tick(now + 75000);
      // Expected: 1500 - 30 - 20 - 10 = 1440
      expect(result.remainingSeconds).toBe(1440);
    });

    it("should detect expiry correctly after resume", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);

      // Work until near end
      engine.pause(now + 1490000); // 1490s elapsed
      const remaining = engine.getRemainingSeconds(now + 1490000);
      expect(remaining).toBe(10); // 10 seconds left

      // Resume and finish
      engine.resume(now + 1490000);
      const result = engine.tick(now + 1500000); // 10 more seconds
      expect(result.remainingSeconds).toBe(0);
      expect(result.expired).toBe(true);
    });

    it("should handle engine not started when pausing", () => {
      const engine = createTimerEngine(defaultSettings);
      expect(() => engine.pause(1720684800000)).not.toThrow();
    });
  });

  // ==================== Reset ====================
  describe("reset", () => {
    it("should reset to initial duration", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);
      engine.pause(now + 60000);
      engine.reset();
      expect(engine.getRemainingSeconds(now + 60000)).toBe(1500);
    });

    it("should allow restart after reset", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);
      engine.pause(now + 60000);
      engine.reset();

      engine.start(now + 60000);
      const result = engine.tick(now + 120000); // 60s later
      expect(result.remainingSeconds).toBe(1440);
      expect(result.expired).toBe(false);
    });
  });

  // ==================== Time Jump Calibration ====================
  describe("time jump calibration", () => {
    it("should detect forward time jump and recalibrate", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);

      // Simulate system clock jumping forward by 10 seconds
      // The time difference between now and the last tick would be > 2s
      const result = engine.tick(now + 10000);
      // Should correctly show 1490 (1500 - 10) even with the jump
      expect(result.remainingSeconds).toBe(1490);
    });

    it("should handle large time jumps gracefully (not go negative)", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);

      // System clock jumped forward by 1 hour
      const result = engine.tick(now + 3600000);
      expect(result.remainingSeconds).toBe(0);
      expect(result.expired).toBe(true);
    });
  });

  // ==================== getRemainingSeconds ====================
  describe("getRemainingSeconds", () => {
    it("should return total duration when engine hasn't started", () => {
      const engine = createTimerEngine(defaultSettings);
      expect(engine.getRemainingSeconds(1720684800000)).toBe(1500);
    });

    it("should return correct seconds during active timer", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);
      expect(engine.getRemainingSeconds(now + 1000)).toBe(1499);
      expect(engine.getRemainingSeconds(now + 60000)).toBe(1440);
      expect(engine.getRemainingSeconds(now + 120000)).toBe(1380);
    });

    it("should clamp at 0 and never go negative", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);

      // Way past end
      const remaining = engine.getRemainingSeconds(now + 999999999);
      expect(remaining).toBe(0);
    });
  });

  // ==================== Custom Config ====================
  describe("custom duration config", () => {
    it("should use custom work minutes", () => {
      const customSettings: DurationConfig = {
        workMinutes: 45,
        shortBreakMinutes: 10,
        longBreakMinutes: 20,
      };
      const engine = createTimerEngine(customSettings);
      const now = 1720684800000;
      engine.start(now);
      expect(engine.getRemainingSeconds(now)).toBe(2700); // 45 * 60
    });

    it("should use custom short break minutes", () => {
      const customSettings: DurationConfig = {
        workMinutes: 30,
        shortBreakMinutes: 10,
        longBreakMinutes: 20,
      };
      const engine = createTimerEngine(customSettings);
      expect(engine.getRemainingSeconds(1720684800000)).toBe(1800); // 30 * 60
    });
  });

  // ==================== Edge Cases ====================
  describe("edge cases", () => {
    it("should handle retrieving remaining seconds at exact second boundaries", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);
      // At exactly 1 second (1000ms)
      expect(engine.getRemainingSeconds(now + 999)).toBe(1500);
      expect(engine.getRemainingSeconds(now + 1000)).toBe(1499);
    });

    it("should handle fractional elapsed time correctly", () => {
      const engine = createTimerEngine(defaultSettings);
      const now = 1720684800000;
      engine.start(now);
      // 500ms passed -> still 1500
      expect(engine.getRemainingSeconds(now + 500)).toBe(1500);
      // 1500ms passed -> 1499 (floor)
      expect(engine.getRemainingSeconds(now + 1500)).toBe(1499);
    });
  });
});
