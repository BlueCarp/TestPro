/**
 * TimerPage 组件
 *
 * 计时器主页，组合以下组件构成完整的番茄钟计时交互界面：
 * - TitleBar（顶部导航栏，含设置图标）
 * - PhaseLabel（阶段标签）
 * - TimerDisplay（倒计时显示）
 * - PomodoroCounter（番茄钟计数）
 * - PrimaryButton（开始/暂停/继续主按钮）
 * - SkipButton（跳过按钮，配合 ConfirmModal）
 * - ResetButton（重置按钮，仅 paused 状态显示）
 *
 * 使用 useTimer + useKeyboard Hooks 桥接 Store 层与 UI 层。
 *
 * 符合 wireframes.md 第 4.1 节（计时器主页 7 个 UI 状态）：
 * - idle: 显示开始按钮 + 25:00 + 🍅×0
 * - running: 显示暂停 + 跳过 + 倒计时递减
 * - paused: 显示继续 + 重置 + 跳过 + 倒计时冻结
 * - work/short_break/long_break: PhaseLabel 正确变化
 * - 长休息结束 → 回到 idle，计数归零
 */

import type { FC } from "react";
import { useCallback, useState } from "react";
import { createTimerStore } from "../../stores/timerStore";
import { useTimer } from "../../hooks/useTimer";
import { useKeyboard } from "../../hooks/useKeyboard";
import { TimerStoreContext } from "../../hooks/useTray";
import { TitleBar } from "../common/TitleBar";
import { ConfirmModal } from "../common/ConfirmModal";
import { PhaseLabel } from "./PhaseLabel";
import { TimerDisplay } from "./TimerDisplay";
import { PrimaryButton } from "./PrimaryButton";
import { SkipButton } from "./SkipButton";
import { ResetButton } from "./ResetButton";
import { PomodoroCounter } from "./PomodoroCounter";
import type { Phase, Status } from "../../types/timer";

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

/** 计时器主体容器样式 */
const timerContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: "480px",
  padding: "0 24px",
  boxSizing: "border-box" as const,
};

/** 按钮行样式（PrimaryButton + SkipButton 并排） */
const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
  marginTop: "24px",
  marginBottom: "16px",
};

interface TimerPageProps {
  /** 自定义 timerStore 实例（测试注入用），未提供则自动创建 */
  timerStore?: ReturnType<typeof createTimerStore>;
}

const TimerPage: FC<TimerPageProps> = ({ timerStore: propTimerStore }) => {
  // 创建 store 实例（测试时可注入 mock）
  const timerStore = propTimerStore ?? createTimerStore();

  // 挂载 Hooks
  useTimer({ timerStore });
  useKeyboard(timerStore);

  // Skip 确认弹窗状态
  const [showSkipModal, setShowSkipModal] = useState(false);

  // 从 store 读取状态
  const state = timerStore.getState();
  const { phase, status, remainingSeconds, completedPomodoros } = state;

  // ==================== 事件处理 ====================

  /** 主按钮点击：start / pause / resume */
  const handlePrimaryClick = useCallback(() => {
    if (status === "idle") {
      timerStore.start();
    } else if (status === "running") {
      timerStore.pause();
    } else if (status === "paused") {
      timerStore.resume();
    }
  }, [status, timerStore]);

  /** 跳过请求：弹出 ConfirmModal */
  const handleSkipRequest = useCallback(() => {
    setShowSkipModal(true);
  }, []);

  /** 确认跳过 */
  const handleSkipConfirm = useCallback(() => {
    setShowSkipModal(false);
    timerStore.confirmSkip();
  }, [timerStore]);

  /** 取消跳过 */
  const handleSkipCancel = useCallback(() => {
    setShowSkipModal(false);
    timerStore.cancelSkip();
  }, [timerStore]);

  /** 点击遮罩关闭弹窗 */
  const handleSkipDismiss = useCallback(() => {
    setShowSkipModal(false);
    timerStore.cancelSkip();
  }, [timerStore]);

  /** 重置 */
  const handleReset = useCallback(() => {
    timerStore.reset();
  }, [timerStore]);

  /** 导航到设置页 */
  const handleSettingsClick = useCallback(() => {
    // V1 通过 hash 路由
    window.location.hash = "settings";
  }, []);

  // ==================== 按钮可见性逻辑 ====================

  // SkipButton: idle 状态隐藏（disabled），running/paused 显示
  const showSkip = status === "running" || status === "paused";

  // ResetButton: 仅 paused 状态显示
  const showReset = status === "paused";

  // ==================== 渲染 ====================

  return (
    <TimerStoreContext.Provider value={timerStore}>
    <div style={pageStyle}>
      {/* 标题栏 */}
      <TitleBar onSettingsClick={handleSettingsClick} />

      {/* 计时器主体 */}
      <div style={timerContainerStyle}>
        {/* 阶段标签 */}
        <PhaseLabel phase={phase as Phase} />

        {/* 倒计时显示 */}
        <TimerDisplay remainingSeconds={remainingSeconds} />

        {/* 番茄钟计数 */}
        <PomodoroCounter count={completedPomodoros} />

        {/* 主操作按钮 */}
        <div style={buttonRowStyle}>
          <PrimaryButton status={status as Status} onClick={handlePrimaryClick} />

          {showSkip && (
            <SkipButton onSkip={handleSkipRequest} disabled={!showSkip} />
          )}

          {showReset && (
            <ResetButton onReset={handleReset} disabled={status !== "paused"} />
          )}
        </div>
      </div>

      {/* 跳过确认弹窗 */}
      {showSkipModal && (
        <ConfirmModal
          message="确定要跳过当前阶段吗？"
          primaryLabel="确定"
          secondaryLabel="取消"
          onPrimary={handleSkipConfirm}
          onSecondary={handleSkipCancel}
          onDismiss={handleSkipDismiss}
        />
      )}
    </div>
    </TimerStoreContext.Provider>
  );
};

export { TimerPage };
export type { TimerPageProps };
