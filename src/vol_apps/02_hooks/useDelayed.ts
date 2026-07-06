import {useEffect, useRef} from "react";

//适用于简单的静态延迟方法
export const useDelayed = <T>(callback: (arg: T) => void, delay: number = 0) => {

    const callbackRef = useRef(callback);
    const timerRef = useRef<number | null>(null);
    const clearTimerRef = () => {
        if (timerRef.current !== null) clearTimeout(timerRef.current);
    }

    useEffect(() => {
        return clearTimerRef
    }, []);

    return (arg: T) => {
        clearTimerRef()
        timerRef.current = setTimeout(() => {
            callbackRef.current(arg);
        }, delay);
    }
}