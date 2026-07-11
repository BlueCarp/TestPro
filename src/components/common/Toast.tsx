import { type FC, useEffect, useRef } from "react";

interface ToastProps {
  /** 提示文案 */
  message: string;
  /** 提示类型：success（成功）或 error（错误） */
  type: "success" | "error";
  /**
   * 自动消失时间（毫秒），默认 2000。
   * 设为 0 表示不自动消失。
   */
  duration?: number;
  /** 自动消失后回调 */
  onDismiss?: () => void;
}

/**
 * 单条 Toast 提示组件
 *
 * 支持 success/error 两种类型。
 * 通过 setTimeout 实现自动消失，在组件卸载时清理定时器。
 */
const Toast: FC<ToastProps> = ({
  message,
  type,
  duration = 2000,
  onDismiss,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (duration > 0 && onDismiss) {
      timerRef.current = setTimeout(() => {
        onDismiss();
      }, duration);
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration, onDismiss]);

  const bgColor = type === "success" ? "#2ecc71" : "#e74c3c";

  return (
    <div
      role="alert"
      style={{
        padding: "12px 20px",
        borderRadius: "8px",
        backgroundColor: bgColor,
        color: "#fff",
        fontSize: "14px",
        lineHeight: 1.4,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        marginBottom: "8px",
        animation: "toastSlideIn 0.3s ease-out",
      }}
    >
      {message}
    </div>
  );
};

export { Toast };
export type { ToastProps };
