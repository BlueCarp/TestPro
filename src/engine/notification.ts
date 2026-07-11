/**
 * 通知模块
 *
 * 封装桌面通知（@tauri-apps/plugin-notification）和声音播放（Web Audio API），
 * 根据设置开关决定是否触发。所有外部调用均被 try-catch 包裹，
 * 失败时静默降级，不中断计时器主流程。
 */

import type { Phase } from "../types/timer";
import type { NotificationConfig } from "../types/settings";

/** 阶段中文名映射，用于通知文案 */
const PHASE_LABELS: Record<Phase, string> = {
  work: "工作",
  short_break: "短休息",
  long_break: "长休息",
};

/** 单例 AudioContext（延迟初始化，用户首次交互后创建） */
let audioCtx: AudioContext | null = null;

/**
 * 获取或创建 AudioContext 实例。
 * 浏览器自动播放策略要求 AudioContext 在用户手势后创建。
 */
function getAudioContext(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      // Web Audio API 不可用（无头环境等）
      return null;
    }
  }
  // 某些浏览器在暂停后需要 resume
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {
      // 静默失败
    });
  }
  return audioCtx;
}

/**
 * 使用 Web Audio API 播放提示音。
 * 产生一个短促的三角波音效。
 *
 * 外部调用不抛异常——即使 AudioContext 不可用也静默降级。
 */
export function playSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {
    // 播放失败静默降级
  }
}

/**
 * 根据设置发送桌面通知。
 *
 * 使用 @tauri-apps/plugin-notification 的 sendNotification API。
 * 在非 Tauri 环境或无权限时静默失败。
 */
async function sendDesktopNotification(
  phase: Phase,
): Promise<void> {
  try {
    const { isPermissionGranted, requestPermission, sendNotification } =
      await import("@tauri-apps/plugin-notification");

    let granted = await isPermissionGranted();
    if (!granted) {
      const permission = await requestPermission();
      granted = permission === "granted";
    }

    if (granted) {
      const title =
        phase === "work"
          ? "🍅 番茄钟完成！"
          : `☕ ${PHASE_LABELS[phase]}结束`;

      const body =
        phase === "work"
          ? "该休息一下了！站起来活动活动吧。"
          : "休息结束，该继续工作了！";

      sendNotification({ title, body });
    }
  } catch {
    // 非 Tauri 环境或无权限时静默降级
  }
}

/**
 * 在阶段切换时触发通知。
 *
 * 根据 settings 中的通知开关决定是否播放声音和/或弹出桌面通知。
 * 所有外部调用均被 try-catch 包裹，失败时不抛异常。
 *
 * @param phase - 结束的阶段
 * @param settings - 通知配置（soundEnabled / desktopNotificationEnabled）
 */
export async function notifyPhaseEnd(
  phase: Phase,
  settings: NotificationConfig,
): Promise<void> {
  try {
    if (settings.soundEnabled) {
      playSound();
    }

    if (settings.desktopNotificationEnabled) {
      await sendDesktopNotification(phase);
    }
  } catch {
    // 通知失败不中断计时器主流程
  }
}
