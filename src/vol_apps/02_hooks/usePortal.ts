import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function usePortal({
                              open,                        // 新增：控制是否挂载容器
                              position,
                              zIndex = 1,
                              exitDuration = 150,          // 退出动画时长，用于延迟卸载
                          }: {
    open: boolean;
    position: { top: number; left: number };
    zIndex?: number;
    exitDuration?: number;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [shouldRender, setShouldRender] = useState(open);

    // 根据 open 管理容器的挂载/卸载时机（带退出动画延迟）
    useEffect(() => {
        if (open) {
            // 打开时立即创建容器并挂载
            if (!containerRef.current) {
                containerRef.current = document.createElement("div");
                containerRef.current.style.position = "fixed";
                containerRef.current.style.zIndex = String(zIndex);
            }
            if (!containerRef.current.parentNode) {
                document.body.appendChild(containerRef.current);
            }
            setShouldRender(true);
        } else {
            // 关闭时：不立即卸载，等待动画播放完
            const timer = setTimeout(() => {
                setShouldRender(false);
                containerRef.current?.remove();
                containerRef.current = null; // 可选：彻底清空引用
            }, exitDuration);
            return () => clearTimeout(timer);
        }
    }, [open, exitDuration, zIndex]);

    // 每当 position 变化时更新样式（仅当容器存在时）
    useEffect(() => {
        const container = containerRef.current;
        if (container && shouldRender) {
            container.style.top = `${position.top}px`;
            container.style.left = `${position.left}px`;
        }
    }, [position.top, position.left, shouldRender]);

    const Portal = useCallback(
        ({ children }: { children: React.ReactNode }) => {
            if (!shouldRender || !containerRef.current) return null;
            return createPortal(children, containerRef.current);
        },
        [shouldRender]
    );

    return Portal;
}