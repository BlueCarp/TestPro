import { type FC } from "react";
import { createPortal } from "react-dom";
import { Toast } from "./Toast";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error";
  duration?: number;
  onDismiss?: () => void;
}

interface ToastContainerProps {
  /** Toast 列表 */
  toasts: ToastItem[];
  /** 当某条 Toast 自动消失时回调 */
  onRemove?: (id: string) => void;
}

/**
 * Toast 容器组件
 *
 * 通过 createPortal 渲染到 document.body。
 * 管理多条 Toast 的显示。
 * Toast 自动消失时回调 onRemove 以通知父组件移除该 Toast。
 */
const ToastContainer: FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  const toastList = (
    <div
      style={{
        position: "fixed",
        top: "60px",
        right: "16px",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={
            toast.onDismiss ??
            (onRemove ? () => onRemove(toast.id) : undefined)
          }
        />
      ))}
    </div>
  );

  return (
    <div>
      {createPortal(toastList, document.body)}
    </div>
  );
};

export { ToastContainer };
export type { ToastContainerProps, ToastItem };
