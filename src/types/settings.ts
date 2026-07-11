/**
 * 设置类型定义
 *
 * 与 specs/api-contract.yaml 中 components/schemas 严格对齐。
 */

/** 用户可配置的三阶段时长。所有值以分钟为单位。校验规则：每个字段值在 [1, 120] 之间。 */
export interface DurationConfig {
  /** 工作阶段时长（分钟），范围 1–120，默认 25 */
  workMinutes: number;
  /** 短休息时长（分钟），范围 1–120，默认 5 */
  shortBreakMinutes: number;
  /** 长休息时长（分钟），范围 1–120，默认 15 */
  longBreakMinutes: number;
}

/** 通知偏好设置 */
export interface NotificationConfig {
  /** 是否在阶段切换时播放提示音，默认 true */
  soundEnabled: boolean;
  /** 是否在阶段切换时弹出桌面通知，默认 true */
  desktopNotificationEnabled: boolean;
}

/** 用户设置完整模型（时长 + 通知偏好） */
export interface Settings extends DurationConfig, NotificationConfig {
  // 组合接口
}

/** 设置校验失败时返回的错误信息 */
export interface SettingsValidationError {
  /** 校验失败的字段名 */
  field: "workMinutes" | "shortBreakMinutes" | "longBreakMinutes";
  /** 错误提示文案 */
  message: string;
}

/** 设置默认值 */
export const DEFAULT_SETTINGS: Settings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  soundEnabled: true,
  desktopNotificationEnabled: true,
};
