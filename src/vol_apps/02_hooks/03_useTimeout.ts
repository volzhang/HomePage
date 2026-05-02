import { useEffect, useRef } from 'react';

/**
 * 延迟执行回调的 Hook。
 * - delay 为 null 或 undefined 时，定时器不会被启动（已有的也会自动清除）。
 * - 组件卸载时自动清除。
 * - 保证总是执行最新的 callback，不需要把 callback 放进依赖数组。
 */
export function useTimeout(callback: () => void, delay: number | null | undefined) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        // delay 不合法时不启动定时器
        if (delay == null) return;

        const id = setTimeout(() => savedCallback.current(), delay);
        return () => clearTimeout(id);
    }, [delay]);
}