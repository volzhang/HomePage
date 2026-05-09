import {useEffect, useRef} from "react";

/**
 * 延迟执行回调的 Hook。
 * - delay 为 null 或 undefined 时，定时器不会被启动（已有的也会自动清除）。
 * - 组件卸载时自动清除。
 * - 保证总是执行最新的 callback，不需要把 callback 放进依赖数组。
 */
export function useTimeout(callback: () => void, delay: number | null | undefined) {
    const savedCallback = useRef(callback);
    savedCallback.current = callback;

    useEffect(() => {
        if (delay == null) return;
        const id = setTimeout(() => savedCallback.current(), delay);
        return () => clearTimeout(id);
    }, [delay]);
}

/**
 * @param open 开关
 * @param handler 函数
 * @param timeout 毫秒
 */
export const useInterval =
    ({
         open = true,
         handler,
         timeout = 3000,
     }: {
         open?: boolean,
         handler?: () => void,
         timeout?: number
     }
    ) => {
        const handlerRef = useRef(handler);
        handlerRef.current = handler;

        const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

        const clear = () => {
            if (timerIdRef.current !== null) {
                clearInterval(timerIdRef.current);
                timerIdRef.current = null;
            }
        }

        const loop = () => {
            timerIdRef.current = setInterval(() => handlerRef.current?.(), timeout);
        }

        useEffect(() => {
            if (!open || !handler || timeout <= 0) {
                clear();
                return;
            }
            clear()
            loop()
            return clear;
        }, [open, timeout, handler]);

        const handleNext = () => {
            if (!open) return
            clear()
            handlerRef.current?.()
            loop()
        }

        return {handleNext,clear,loop}
    }