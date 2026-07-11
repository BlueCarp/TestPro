import { type FC, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  /** 提示文案 */
  message: string;
  /** 主操作按钮文本（如 "确定"） */
  primaryLabel: string;
  /** 次操作按钮文本（如 "取消"） */
  secondaryLabel: string;
  /** 主操作回调 */
  onPrimary: () => void;
  /** 次操作回调 */
  onSecondary: () => void;
  /** 遮罩点击或 Escape 键关闭回调 */
  onDismiss: () => void;
}

/**
 * 通用确认弹窗组件
 *
 * 通过 createPortal 渲染到 document.body。
 * 支持主/次两个操作按钮、遮罩点击关闭、Escape 键关闭。
 *
 * 使用场景：
 * - "跳过当前阶段" 确认
 * - "放弃未保存的修改" 确认
 */
const ConfirmModal: FC<ConfirmModalProps> = ({
  message,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onDismiss,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    },
    [onDismiss],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    // 仅在点击遮罩层本身时触发 dismiss
    if (e.target === e.currentTarget) {
      onDismiss();
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "24px",
          minWidth: "300px",
          maxWidth: "400px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.16)",
        }}
      >
        <p
          style={{
            margin: "0 0 24px",
            fontSize: "16px",
            lineHeight: 1.5,
            textAlign: "center",
            color: "#1a1a1a",
          }}
        >
          {message}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={onSecondary}
            style={{
              padding: "8px 24px",
              borderRadius: "8px",
              border: "1px solid #d0d0d0",
              backgroundColor: "#fff",
              color: "#333",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            {secondaryLabel}
          </button>
          <button
            type="button"
            onClick={onPrimary}
            style={{
              padding: "8px 24px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#e74c3c",
              color: "#fff",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export { ConfirmModal };
export type { ConfirmModalProps };
