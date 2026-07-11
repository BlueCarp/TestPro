/**
 * 将秒数格式化为 MM:SS 格式字符串。
 *
 * @param seconds - 剩余秒数（非负整数或浮点数，负值按 0 处理）
 * @returns 格式化后的 MM:SS 字符串
 *
 * @example
 * formatTime(90)    // → "01:30"
 * formatTime(0)     // → "00:00"
 * formatTime(3661)  // → "61:01"
 */
export function formatTime(seconds: number): string {
  // 处理无效输入
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");

  return `${mm}:${ss}`;
}
