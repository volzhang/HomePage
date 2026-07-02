// import {useRef, useEffect, useCallback} from "react";
//
// /* ---------- Props ---------- */
// interface ClockProps {
//     /** 正方形边长，默认 500 */
//     size?: number;
//     /** 线条、文字、阴影的主色，默认 #00ffff */
//     strokeColor?: string;
//     /** 径向渐变的内圈颜色，默认 #03303a */
//     bgColorStart?: string;
//     /** 径向渐变的外圈颜色，默认 black */
//     bgColorEnd?: string;
//     /** 字体，默认 Helvetica */
//     font?: string;
// }
//
// /* ---------- 工具函数 ---------- */
// const degToRad = (deg: number) => (Math.PI / 180) * deg;
//
// /* ---------- 组件 ---------- */
// export const Clock = ({
//                                          size = 1000,
//                                          strokeColor = "#0078d7",
//                                          bgColorStart = "white",
//                                          bgColorEnd = "white",
//                                          font = "Terminal",
//                                          // size = 500,
//                                          // strokeColor = '#00ffff',
//                                          // bgColorStart = '#03303a',
//                                          // bgColorEnd = 'black',
//                                          // font = 'Helvetica',
//                                      }: ClockProps) => {
//
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
//
//     const renderTime = useCallback(() => {
//         const ctx = ctxRef.current;
//         if (!ctx) return;
//
//         const now = new Date();
//         const hours = now.getHours();
//         const minutes = now.getMinutes();
//         const seconds = now.getSeconds();
//         const millis = now.getMilliseconds();
//
//         // ---- 三层比例 ----
//         // 外圈：12 小时制，精确到秒（每秒跳变，视觉可感知但不过度闪烁）
//         const halfDayFraction =
//             ((hours % 12) * 3600 + minutes * 60 + seconds) / 43200; // 12h = 43200s
//
//         // 中圈：当前小时进度，精确到毫秒（平滑移动，适合大尺寸观察）
//         const hourFraction =
//             (minutes * 60000 + seconds * 1000 + millis) / 3600000; // 1h = 3,600,000ms
//
//         // 内圈：当前分钟进度，精确到毫秒（最细腻动画）
//         const minuteFraction = (seconds * 1000 + millis) / 60000; // 1min = 60,000ms
//
//         // ---- 动态缩放 ----
//         const scale = size / 500;          // 以 500×500 为基准
//         const center = size / 2;
//
//         ctx.clearRect(0, 0, size, size);
//
//         // 径向渐变背景（颜色可配置）
//         const gradient = ctx.createRadialGradient(
//             center, center, 5 * scale,
//             center, center, 300 * scale
//         );
//         gradient.addColorStop(0, bgColorStart);
//         gradient.addColorStop(1, bgColorEnd);
//         ctx.fillStyle = gradient;
//         ctx.fillRect(0, 0, size, size);
//
//         // 描边样式（所有尺寸按 scale 缩放）
//         ctx.strokeStyle = strokeColor;
//         ctx.lineWidth = 18.5 * scale;
//         // ctx.shadowBlur = 4 * scale;
//         // ctx.shadowColor = strokeColor;
//
//         // 绘弧辅助
//         const drawArc = (radius: number, fraction: number) => {
//             ctx.beginPath();
//             ctx.arc(
//                 center, center,
//                 radius,
//                 degToRad(270),
//                 degToRad(270 + fraction * 360)
//             );
//             ctx.stroke();
//         };
//
//         drawArc(229 * scale, halfDayFraction);  // 外圈
//         drawArc(199 * scale, hourFraction);     // 中圈（毫秒平滑）
//         drawArc(169 * scale, minuteFraction);   // 内圈
//
//         // ---------- 文字绘制（替换原来的时间相关部分） ----------
// // 设置水平居中
//         ctx.textAlign = "center";
//
// // 日期文字
//         ctx.font = `700 ${29 * scale}px ${font}`;
//         ctx.fillStyle = strokeColor;
//         ctx.fillText(now.toDateString(), center, 196 * scale);
//
// // 时间文字：24小时制 + 毫秒，全部补零（固定宽度，杜绝跳动）
//         const hh = String(hours).padStart(2, "0");
//         const mm = String(minutes).padStart(2, "0");
//         const ss = String(seconds).padStart(2, "0");
//         // const ms = String(millis).padStart(3, '0');
//         // const time24 = `${hh}:${mm}:${ss}:${ms}`;
//         const time24 = `${hh}:${mm}:${ss}`;
//
//         ctx.font = `900 ${66 * scale}px ${font}`;
//         ctx.fillText(time24, center, 281 * scale);
//
// // 恢复默认对齐（可选）
//         ctx.textAlign = "start";
//
//     }, [size, strokeColor, bgColorStart, bgColorEnd]);
//
//     useEffect(() => {
//         if (canvasRef.current) {
//             ctxRef.current = canvasRef.current.getContext("2d");
//         }
//         const id = setInterval(renderTime, 10); // 40ms 刷新，保持平滑
//         return () => clearInterval(id);
//     }, [renderTime]);
//
//     return (
//         <canvas
//             ref={canvasRef}
//             width={size}
//             height={size}
//             style={{display: "block"}}
//         />
//     );
// };