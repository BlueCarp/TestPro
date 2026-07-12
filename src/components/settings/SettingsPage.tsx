/**
 * SettingsPage 组件
 *
 * 设置页面，组合 DurationInput × 3、ToggleSwitch × 2、保存/恢复默认按钮。
 * 使用 settingsStore 读写配置，isDirty 时离开检测弹出 ConfirmModal。
 *
 * 符合 wireframes.md 第 4.2 节（设置页面线框图 + 3 个状态）：
 * - 初始状态：显示当前设置值
 * - 编辑状态：isDirty=true，显示保存/恢复默认按钮
 * - 校验失败：错误行高亮 + Toast 提示
 *
 * 数据流：
 *   编辑 → DurationInput/ToggleSwitch → 本地 state（不直接写 store）
 *   保存 → settingsStore.save() → 校验通过 → Toast success → 导航回 /
 *                               → 校验失败 → Toast error + 行高亮
 *   恢复默认 → settingsStore.resetDefaults()
 *   离开检测 → isDirty 时弹出 ConfirmModal "有未保存的修改，确定离开吗？"
 */

import type { FC, MouseEvent } from "react";
import { useState, useCallback, useRef } from "react";
import { createSettingsStore, type SettingsStore } from "../../stores/settingsStore";
import { DurationInput } from "./DurationInput";
import { ToggleSwitch } from "./ToggleSwitch";
import { TitleBar } from "../common/TitleBar";
import { ConfirmModal } from "../common/ConfirmModal";
import { ToastContainer, type ToastItem } from "../common/ToastContainer";
import { validateDuration } from "../../utils/validation";
import type { SettingsValidationError } from "../../types/settings";

/** 页面根容器样式 */
const pageStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100vh",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  backgroundColor: "#fafafa",
  color: "#1a1a1a",
};

/** 设置卡片容器 */
const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "24px 32px",
  width: "100%",
  maxWidth: "480px",
  marginTop: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

/** 分区标题 */
const sectionTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#1a1a1a",
  marginTop: "24px",
  marginBottom: "12px",
  paddingBottom: "8px",
  borderBottom: "1px solid #eee",
};

/** 按钮容器 */
const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "24px",
  paddingTop: "16px",
  borderTop: "1px solid #eee",
};

interface SettingsPageProps {
  /** 自定义 settingsStore 实例（测试注入用），未提供则自动创建 */
  settingsStore?: SettingsStore;
  /** 导航回计时器主页的回调 */
  onNavigateHome?: () => void;
}

const SettingsPage: FC<SettingsPageProps> = ({
  settingsStore: propStore,
  onNavigateHome,
}) => {
  const store = propStore ?? createSettingsStore();

  // 本地编辑状态（避免每次 +/- 都触发 store 更新）
  const [workMinutes, setWorkMinutes] = useState(() => store.getState().workMinutes);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(() =>
    store.getState().shortBreakMinutes,
  );
  const [longBreakMinutes, setLongBreakMinutes] = useState(() =>
    store.getState().longBreakMinutes,
  );
  const [soundEnabled, setSoundEnabled] = useState(() =>
    store.getState().soundEnabled,
  );
  const [desktopNotificationEnabled, setDesktopNotificationEnabled] = useState(
    () => store.getState().desktopNotificationEnabled,
  );

  // 校验错误追踪
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, SettingsValidationError | null>
  >({
    workMinutes: null,
    shortBreakMinutes: null,
    longBreakMinutes: null,
  });

  // 离开确认弹窗
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Toast 列表
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  /** 添加 Toast */
  const addToast = useCallback(
    (message: string, type: "success" | "error") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, type, duration: 3000 }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    [],
  );

  /** 移除 Toast */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 同步本地状态到 store（当 store 外部变化时）
  const syncRef = useRef(true);
  store.subscribe((state) => {
    if (syncRef.current) return; // 初始化阶段不触发同步
    setWorkMinutes(state.workMinutes);
    setShortBreakMinutes(state.shortBreakMinutes);
    setLongBreakMinutes(state.longBreakMinutes);
    setSoundEnabled(state.soundEnabled);
    setDesktopNotificationEnabled(state.desktopNotificationEnabled);
    setFieldErrors({
      workMinutes: null,
      shortBreakMinutes: null,
      longBreakMinutes: null,
    });
  });

  // 初始化后关闭 syncRef 锁
  syncRef.current = false;

  // ==================== 本地 setter ====================

  const handleWorkChange = useCallback(
    (v: number) => {
      setWorkMinutes(v);
      setFieldErrors((prev) => ({ ...prev, workMinutes: null }));
    },
    [],
  );
  const handleShortBreakChange = useCallback(
    (v: number) => {
      setShortBreakMinutes(v);
      setFieldErrors((prev) => ({ ...prev, shortBreakMinutes: null }));
    },
    [],
  );
  const handleLongBreakChange = useCallback(
    (v: number) => {
      setLongBreakMinutes(v);
      setFieldErrors((prev) => ({ ...prev, longBreakMinutes: null }));
    },
    [],
  );
  const handleSoundChange = useCallback((v: boolean) => {
    setSoundEnabled(v);
  }, []);
  const handleDesktopNotifChange = useCallback((v: boolean) => {
    setDesktopNotificationEnabled(v);
  }, []);

  // ==================== 操作 ====================

  /** 保存设置 */
  const handleSave = useCallback(async () => {
    // 先将本地值写入 store（更新 store 状态）
    store.getState().updateWorkMinutes(workMinutes);
    store.getState().updateShortBreakMinutes(shortBreakMinutes);
    store.getState().updateLongBreakMinutes(longBreakMinutes);
    // 通知开关通过直接设置方法（P1-2 修复：不再用 toggle 翻转）
    if (soundEnabled !== store.getState().soundEnabled) {
      store.getState().setSoundEnabled(soundEnabled);
    }
    if (desktopNotificationEnabled !== store.getState().desktopNotificationEnabled) {
      store.getState().setDesktopNotificationEnabled(desktopNotificationEnabled);
    }

    // 前端校验
    const errors: Record<string, SettingsValidationError | null> = {
      workMinutes: null,
      shortBreakMinutes: null,
      longBreakMinutes: null,
    };
    const wErr = validateDuration(workMinutes, "workMinutes");
    if (wErr) errors.workMinutes = wErr;
    const sbErr = validateDuration(shortBreakMinutes, "shortBreakMinutes");
    if (sbErr) errors.shortBreakMinutes = sbErr;
    const lbErr = validateDuration(longBreakMinutes, "longBreakMinutes");
    if (lbErr) errors.longBreakMinutes = lbErr;

    if (errors.workMinutes || errors.shortBreakMinutes || errors.longBreakMinutes) {
      setFieldErrors(errors);
      const firstError = errors.workMinutes ?? errors.shortBreakMinutes ?? errors.longBreakMinutes;
      if (firstError) {
        addToast(firstError.message, "error");
      }
      return;
    }

    // 持久化保存
    const result = await store.getState().save();
    if (result.success) {
      addToast("设置已保存", "success");
      if (onNavigateHome) {
        onNavigateHome();
      } else {
        window.location.hash = "";
      }
    } else if (!result.success) {
      addToast(result.error.message, "error");
      setFieldErrors({ [result.field]: result.error });
    }
  }, [
    store,
    workMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    soundEnabled,
    desktopNotificationEnabled,
    addToast,
    onNavigateHome,
  ]);

  /** 恢复默认设置 */
  const handleResetDefaults = useCallback(() => {
    store.getState().resetDefaults();
    addToast("已恢复默认设置", "success");
  }, [store, addToast]);

  /** 离开设置页 */
  const handleNavigateAway = useCallback(
    (_e: MouseEvent) => {
      // 导航到主页时调用（TitleBar 设置按钮的 onClick）
      if (onNavigateHome) {
        onNavigateHome();
      } else {
        window.location.hash = "";
      }
    },
    [onNavigateHome],
  );

  /** 确认离开（放弃修改） */
  const handleConfirmLeave = useCallback(() => {
    setShowLeaveModal(false);
    // 放弃修改：恢复 store 值
    const state = store.getState();
    setWorkMinutes(state.workMinutes);
    setShortBreakMinutes(state.shortBreakMinutes);
    setLongBreakMinutes(state.longBreakMinutes);
    setSoundEnabled(state.soundEnabled);
    setDesktopNotificationEnabled(state.desktopNotificationEnabled);
    setFieldErrors({
      workMinutes: null,
      shortBreakMinutes: null,
      longBreakMinutes: null,
    });
    // 导航
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.hash = "";
    }
  }, [store, onNavigateHome]);

  /** 取消离开（继续编辑） */
  const handleCancelLeave = useCallback(() => {
    setShowLeaveModal(false);
  }, []);

  // 判断是否有未保存的修改
  const hasUnsavedChanges =
    workMinutes !== store.getState().workMinutes ||
    shortBreakMinutes !== store.getState().shortBreakMinutes ||
    longBreakMinutes !== store.getState().longBreakMinutes ||
    soundEnabled !== store.getState().soundEnabled ||
    desktopNotificationEnabled !== store.getState().desktopNotificationEnabled;

  /** 安全的离开处理（带未保存检测） */
  const handleSafeNavigate = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowLeaveModal(true);
    } else {
      handleNavigateAway({} as MouseEvent);
    }
  }, [hasUnsavedChanges, handleNavigateAway]);

  return (
    <div style={pageStyle}>
      {/* Toast 容器 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* 标题栏 */}
      <TitleBar onSettingsClick={handleSafeNavigate} />

      {/* 设置卡片 */}
      <div style={cardStyle}>
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "22px",
            fontWeight: 700,
            color: "#1a1a1a",
          }}
        >
          设置
        </h2>
        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#888" }}>
          调整计时器时长和通知偏好
        </p>

        {/* 时长设置 */}
        <div style={sectionTitleStyle}>时长设置</div>

        <DurationInput
          value={workMinutes}
          fieldName="workMinutes"
          label="工作时长"
          onChange={handleWorkChange}
          error={fieldErrors.workMinutes}
        />

        <DurationInput
          value={shortBreakMinutes}
          fieldName="shortBreakMinutes"
          label="短休息时长"
          onChange={handleShortBreakChange}
          error={fieldErrors.shortBreakMinutes}
        />

        <DurationInput
          value={longBreakMinutes}
          fieldName="longBreakMinutes"
          label="长休息时长"
          onChange={handleLongBreakChange}
          error={fieldErrors.longBreakMinutes}
        />

        {/* 通知设置 */}
        <div style={sectionTitleStyle}>通知设置</div>

        <ToggleSwitch
          checked={soundEnabled}
          label="提示音通知"
          onChange={handleSoundChange}
        />

        <ToggleSwitch
          checked={desktopNotificationEnabled}
          label="桌面通知"
          onChange={handleDesktopNotifChange}
        />

        {/* 操作按钮 */}
        <div style={buttonRowStyle}>
          <button
            type="button"
            onClick={handleResetDefaults}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid #d0d0d0",
              backgroundColor: "#fff",
              color: "#666",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            恢复默认
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#3498db",
              color: "#fff",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            保存设置
          </button>
        </div>
      </div>

      {/* 离开确认弹窗 */}
      {showLeaveModal && (
        <ConfirmModal
          message="有未保存的修改，确定离开吗？"
          primaryLabel="放弃"
          secondaryLabel="继续编辑"
          onPrimary={handleConfirmLeave}
          onSecondary={handleCancelLeave}
          onDismiss={handleCancelLeave}
        />
      )}
    </div>
  );
};

export { SettingsPage };
export type { SettingsPageProps };
