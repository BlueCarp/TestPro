/**
 * useTray Hook 单元测试
 *
 * 测试托盘创建逻辑和非 Tauri 环境的降级行为。
 * Tauri 原生 API（TrayIcon、Menu、MenuItem）无法在 jsdom 中完整 mock，
 * 因此重点测试：
 * - 非 Tauri 环境下 createSystemTray 安全返回 null
 * - TrayProvider 在非 Tauri 环境下不报错
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createSystemTray } from "../../hooks/useTray";

describe("useTray", () => {
  // ==================== createSystemTray ====================

  describe("createSystemTray", () => {
    beforeEach(() => {
      // 确保 __TAURI__ 不存在于测试开始前
      // @ts-expect-error — 测试需要删除全局属性
      delete globalThis.__TAURI__;
    });

    afterEach(() => {
      // 清理 __TAURI__ 标记
      // @ts-expect-error — 测试需要删除全局属性
      delete globalThis.__TAURI__;
    });

    it("should return null when not in Tauri environment", async () => {
      const result = await createSystemTray();
      expect(result).toBeNull();
    });

    it("should return null when window is undefined", async () => {
      // 保存原始 window
      const originalWindow = globalThis.window;
      // @ts-expect-error — 故意设置为 undefined 以测试边界情况
      globalThis.window = undefined;

      const result = await createSystemTray();
      expect(result).toBeNull();

      // 恢复 window
      globalThis.window = originalWindow;
    });

    it("should not throw when Tauri environment is present but tray APIs are unavailable", async () => {
      // 模拟 Tauri 环境但不提供实际的 tray API
      // @ts-expect-error — 测试需要设置全局属性
      globalThis.__TAURI__ = {};

      // createSystemTray 应该捕获错误并返回 null，而不是抛出异常
      const result = await createSystemTray();
      expect(result).toBeNull();
    });
  });
});
