/**
 * useNotification Hook 单元测试
 *
 * 测试通知触发、settingsStore 偏好读取、soundEnabled=false 时行为。
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createSettingsStore, type SettingsStore } from "../../stores/settingsStore";
import { useNotification } from "../../hooks/useNotification";
import * as notificationModule from "../../engine/notification";
import type { Phase } from "../../types/timer";

describe("useNotification", () => {
  let settingsStore: SettingsStore;

  beforeEach(() => {
    vi.useFakeTimers();
    settingsStore = createSettingsStore();
    // Spy on notifyPhaseEnd to verify it's called correctly
    vi.spyOn(notificationModule, "notifyPhaseEnd").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ==================== Basic Behavior ====================

  describe("basic behavior", () => {
    it("should return a notifyPhaseEnd function", () => {
      const { result } = renderHook(() => useNotification(settingsStore));
      expect(typeof result.current.notifyPhaseEnd).toBe("function");
    });

    it("should call notifyPhaseEnd with correct phase and settings", async () => {
      const { result } = renderHook(() => useNotification(settingsStore));

      await act(async () => {
        await result.current.notifyPhaseEnd("work" as Phase);
      });

      expect(notificationModule.notifyPhaseEnd).toHaveBeenCalledWith("work", {
        soundEnabled: true,
        desktopNotificationEnabled: true,
      });
    });
  });

  // ==================== Sound Disabled ====================

  describe("soundEnabled=false", () => {
    it("should not play sound but desktop notification still works", async () => {
      // Disable sound
      act(() => {
        settingsStore.getState().toggleSound();
      });

      const { result } = renderHook(() => useNotification(settingsStore));

      await act(async () => {
        await result.current.notifyPhaseEnd("short_break" as Phase);
      });

      expect(notificationModule.notifyPhaseEnd).toHaveBeenCalledWith("short_break", {
        soundEnabled: false,
        desktopNotificationEnabled: true,
      });
    });
  });

  // ==================== Desktop Notification Disabled ====================

  describe("desktopNotificationEnabled=false", () => {
    it("should send notification config with desktopNotificationEnabled=false", async () => {
      act(() => {
        settingsStore.getState().toggleDesktopNotification();
      });

      const { result } = renderHook(() => useNotification(settingsStore));

      await act(async () => {
        await result.current.notifyPhaseEnd("long_break" as Phase);
      });

      expect(notificationModule.notifyPhaseEnd).toHaveBeenCalledWith("long_break", {
        soundEnabled: true,
        desktopNotificationEnabled: false,
      });
    });
  });

  // ==================== Both Disabled ====================

  describe("both notifications disabled", () => {
    it("should pass soundEnabled=false and desktopNotificationEnabled=false", async () => {
      act(() => {
        settingsStore.getState().toggleSound();
        settingsStore.getState().toggleDesktopNotification();
      });

      const { result } = renderHook(() => useNotification(settingsStore));

      await act(async () => {
        await result.current.notifyPhaseEnd("work" as Phase);
      });

      expect(notificationModule.notifyPhaseEnd).toHaveBeenCalledWith("work", {
        soundEnabled: false,
        desktopNotificationEnabled: false,
      });
    });
  });

  // ==================== No Settings Store ====================

  describe("no settings store", () => {
    it("should not throw when settingsStore is undefined", () => {
      const { result } = renderHook(() => useNotification());
      expect(result.current.notifyPhaseEnd).toBeDefined();
    });

    it("should not call notifyPhaseEnd when no settingsStore", async () => {
      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.notifyPhaseEnd("work" as Phase);
      });

      // Should not have been called since no settingsStore
      expect(notificationModule.notifyPhaseEnd).not.toHaveBeenCalled();
    });
  });
});
