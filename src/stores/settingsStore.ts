/**
 * 设置 Store
 *
 * Zustand store，通过 @tauri-apps/plugin-store 实现持久化。
 * 持有用户可配置的计时时长和通知偏好，提供 update/toggle/save/load/resetDefaults 方法。
 *
 * 数据流：
 *   update/toggle → isDirty=true → save → validate → Tauri Store.set
 *                                         ↓ 失败
 *                                   返回错误，isDirty 不变
 *
 *   load → Tauri Store.get → 成功→更新状态
 *                         → 失败→回退默认值
 */

import { create } from "zustand";
import { DEFAULT_SETTINGS } from "../types/settings";
import type { Settings, SettingsValidationError } from "../types/settings";
import { validateDuration } from "../utils/validation";

/** Store 键名（Tauri Store 中的 key） */
const STORE_KEY = "settings";

/** 保存 / load 结果类型 */
export type SaveResult =
  | { success: true }
  | { success: false; error: SettingsValidationError; field: string };

/** SettingsStore 接口 */
export interface SettingsStore extends Settings {
  isDirty: boolean;

  // 更新方法
  updateWorkMinutes: (value: number) => void;
  updateShortBreakMinutes: (value: number) => void;
  updateLongBreakMinutes: (value: number) => void;

  // 切换方法
  toggleSound: () => void;
  toggleDesktopNotification: () => void;

  // 持久化操作
  save: () => Promise<SaveResult>;
  resetDefaults: () => void;
  load: () => Promise<void>;

  // Zustand store api
  getState: () => SettingsStore;
  setState: (partial: Partial<SettingsStore> | ((state: SettingsStore) => Partial<SettingsStore>)) => void;
  subscribe: (listener: (state: SettingsStore) => void) => () => void;
}

/**
 * 获取 Tauri Store 实例。
 * 在非 Tauri 环境（如测试）中返回 null。
 */
async function getTauriStore(): Promise<{ get: (key: string) => Promise<string | null>; set: (key: string, value: unknown) => Promise<void>; save: () => Promise<void> } | null> {
  try {
    const { load } = await import("@tauri-apps/plugin-store");
    const store = await load("settings.json", { autoSave: true });
    return store;
  } catch {
    // 非 Tauri 环境或插件未初始化
    return null;
  }
}

/**
 * 验证所有时长字段。
 * 返回第一个校验失败的错误，或 null 表示全部通过。
 */
function validateSettings(settings: Settings): SettingsValidationError | null {
  const fields: Array<{ value: number; field: "workMinutes" | "shortBreakMinutes" | "longBreakMinutes" }> = [
    { value: settings.workMinutes, field: "workMinutes" },
    { value: settings.shortBreakMinutes, field: "shortBreakMinutes" },
    { value: settings.longBreakMinutes, field: "longBreakMinutes" },
  ];

  for (const { value, field } of fields) {
    const error = validateDuration(value, field);
    if (error) return error;
  }

  return null;
}

/**
 * 创建设置 Store 实例。
 */
export function createSettingsStore(): SettingsStore {
  const store = create<SettingsStore>((set, get) => ({
    ...DEFAULT_SETTINGS,
    isDirty: false,

    // ==================== Update Methods ====================

    updateWorkMinutes: (value: number) => {
      set({ workMinutes: value, isDirty: true });
    },

    updateShortBreakMinutes: (value: number) => {
      set({ shortBreakMinutes: value, isDirty: true });
    },

    updateLongBreakMinutes: (value: number) => {
      set({ longBreakMinutes: value, isDirty: true });
    },

    // ==================== Toggle Methods ====================

    toggleSound: () => {
      set((state) => ({ soundEnabled: !state.soundEnabled, isDirty: true }));
    },

    toggleDesktopNotification: () => {
      set((state) => ({ desktopNotificationEnabled: !state.desktopNotificationEnabled, isDirty: true }));
    },

    // ==================== Save ====================

    save: async (): Promise<SaveResult> => {
      const state = get();
      const settings: Settings = {
        workMinutes: state.workMinutes,
        shortBreakMinutes: state.shortBreakMinutes,
        longBreakMinutes: state.longBreakMinutes,
        soundEnabled: state.soundEnabled,
        desktopNotificationEnabled: state.desktopNotificationEnabled,
      };

      // 先校验
      const validationError = validateSettings(settings);
      if (validationError) {
        return {
          success: false,
          error: validationError,
          field: validationError.field,
        };
      }

      // 写入 Tauri Store
      const tauriStore = await getTauriStore();
      if (tauriStore) {
        try {
          await tauriStore.set(STORE_KEY, settings);
          await tauriStore.save();
        } catch {
          // 写入失败不阻塞——store 内存状态仍然有效
        }
      }

      set({ isDirty: false });
      return { success: true };
    },

    // ==================== Reset Defaults ====================

    resetDefaults: () => {
      set({
        ...DEFAULT_SETTINGS,
        isDirty: false,
      });
    },

    // ==================== Load ====================

    load: async (): Promise<void> => {
      try {
        const tauriStore = await getTauriStore();
        if (tauriStore) {
          const raw = await tauriStore.get(STORE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Partial<Settings>;
            // 合并——只取有效字段，缺失字段使用默认值
            set({
              workMinutes: typeof parsed.workMinutes === "number" ? parsed.workMinutes : DEFAULT_SETTINGS.workMinutes,
              shortBreakMinutes: typeof parsed.shortBreakMinutes === "number" ? parsed.shortBreakMinutes : DEFAULT_SETTINGS.shortBreakMinutes,
              longBreakMinutes: typeof parsed.longBreakMinutes === "number" ? parsed.longBreakMinutes : DEFAULT_SETTINGS.longBreakMinutes,
              soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
              desktopNotificationEnabled: typeof parsed.desktopNotificationEnabled === "boolean" ? parsed.desktopNotificationEnabled : DEFAULT_SETTINGS.desktopNotificationEnabled,
              isDirty: false,
            });
            return;
          }
        }
      } catch {
        // 读取失败走回退
      }

      // 回退：使用默认值
      set({
        ...DEFAULT_SETTINGS,
        isDirty: false,
      });
    },
  })) as unknown as SettingsStore;

  return store;
}
