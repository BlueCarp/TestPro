import type { FC } from "react";

interface TitleBarProps {
  /** 设置图标点击回调 */
  onSettingsClick?: () => void;
}

/**
 * 标题栏组件
 *
 * 显示应用名（🍅 Pomodoro）和设置图标按钮（⚙）。
 * 符合 wireframes.md 中计时器主页和设置页面的标题栏设计。
 */
const TitleBar: FC<TitleBarProps> = ({ onSettingsClick }) => {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <span style={{ fontSize: "18px", fontWeight: 600 }}>
        🍅 Pomodoro
      </span>
      <button
        type="button"
        onClick={onSettingsClick}
        aria-label="设置"
        style={{
          background: "none",
          border: "none",
          fontSize: "22px",
          cursor: "pointer",
          padding: "4px 8px",
          lineHeight: 1,
        }}
      >
        ⚙
      </button>
    </header>
  );
};

export { TitleBar };
export type { TitleBarProps };
