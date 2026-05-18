// 用于UI显示，将秒值转换为MMSS字符串，NaN和近似0都返回""
export const formatMMSS = (sec: number) => {
    if (Number.isNaN(sec)) return ""
    if (sec <= 0.1) return "";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
};