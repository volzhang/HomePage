import {type RefObject, useEffect, useRef} from "react";

export const useRafThrottleSetState = <T>(
    valueRef: RefObject<T>,
    setState: (v: T) => void,
    interval = 50
) => {
    const lastUpdateRef = useRef(0);

    useEffect(() => {
        let raf: number;

        const loop = () => {
            const now = performance.now();

            if (now - lastUpdateRef.current > interval) {
                lastUpdateRef.current = now;
                setState(valueRef.current);
            }

            raf = requestAnimationFrame(loop);
        };

        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [setState, valueRef, interval]);
};