import {useEffect, useRef} from "react";

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

        return {handleNext, clear, loop}
    }