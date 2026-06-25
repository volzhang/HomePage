import { useState, useEffect, useRef } from 'react';

/**
 * 平滑数字过渡 Hook
 * @param target 目标值
 * @param duration 过渡时长（毫秒）
 * @param updateInterval 输出值更新间隔（毫秒），默认为 0（每帧更新）
 * @param threshold 最小变化量，小于此值不触发更新（默认 0.001）
 * @returns 当前平滑值
 */

export function useSmoothNumber(
    target: number,
    duration: number = 300,
    updateInterval: number = 0,
    threshold: number = 0.001
): number {
    const [current, setCurrent] = useState(target);
    const rafRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const startValueRef = useRef<number>(target);
    const targetRef = useRef(target);
    const lastUpdateTimeRef = useRef<number>(0);
    const lastValueRef = useRef<number>(target); // 用于阈值比较

    useEffect(() => {
        if (Math.abs(target - current) < threshold) {
            setCurrent(target);
            return;
        }

        startValueRef.current = current;
        targetRef.current = target;
        startTimeRef.current = performance.now();
        lastUpdateTimeRef.current = startTimeRef.current;

        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        const update = () => {
            const now = performance.now();
            let progress = (now - startTimeRef.current) / duration;
            if (progress >= 1) {
                progress = 1;
                setCurrent(targetRef.current);
                rafRef.current = null;
                return;
            }
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = startValueRef.current + (targetRef.current - startValueRef.current) * eased;

            // 判断是否需要更新输出值
            const shouldUpdate =
                (now - lastUpdateTimeRef.current) >= updateInterval &&
                Math.abs(value - lastValueRef.current) > threshold;

            if (shouldUpdate) {
                setCurrent(value);
                lastUpdateTimeRef.current = now;
                lastValueRef.current = value;
            }

            rafRef.current = requestAnimationFrame(update);
        };

        rafRef.current = requestAnimationFrame(update);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration, updateInterval, threshold]);

    return current;
}