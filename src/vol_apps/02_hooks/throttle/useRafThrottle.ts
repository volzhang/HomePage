import { useCallback, useEffect, useRef } from "react";

export const useRafThrottle = (fn: () => void) => {
    const frameRef = useRef<number | null>(null);
    const pendingRef = useRef(false);

    const fnRef = useRef(fn);
    fnRef.current = fn;

    const run = useCallback(() => {
        if (pendingRef.current) return;
        pendingRef.current = true;

        frameRef.current = requestAnimationFrame(() => {
            pendingRef.current = false;
            fnRef.current();
        });
    }, []);

    useEffect(() => {
        return () => {
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    return run;
};