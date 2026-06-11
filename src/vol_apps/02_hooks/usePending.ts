import { useEffect, useRef, useState, useCallback } from "react";

/**
 * 根据原始 pending 信号，返回经过最小/最大时间修正后的 pending
 * @param maxTimeout 最大等待时间(ms)，超时后强制结束
 * @param minTimeout 最小保持时间(ms)，即使 originalPending 提前结束也会至少保持此时间
 * @param originalPending 外部原始 pending 状态（响应式布尔值）
 * @returns 修正后的 pending
 */
export function useFixedPending(
    maxTimeout: number,
    minTimeout: number,
    originalPending: boolean
): boolean {
    const [pending, setPending] = useState(false);
    const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const minTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number>(0);

    // 清除所有计时器并置为 false
    const forceEnd = useCallback(() => {
        if (maxTimerRef.current) {
            clearTimeout(maxTimerRef.current);
            maxTimerRef.current = null;
        }
        if (minTimerRef.current) {
            clearTimeout(minTimerRef.current);
            minTimerRef.current = null;
        }
        setPending(false);
        startTimeRef.current = 0;
    }, []);

    useEffect(() => {
        // 清理函数
        return () => {
            if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
            if (minTimerRef.current) clearTimeout(minTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (originalPending) {
            // 原始 pending 变为 true：开始计时
            // 重置之前可能残留的定时器
            if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
            if (minTimerRef.current) clearTimeout(minTimerRef.current);
            startTimeRef.current = Date.now();
            setPending(true);

            // 设置最大超时
            maxTimerRef.current = setTimeout(() => {
                forceEnd();
            }, maxTimeout);
        } else {
            // 原始 pending 变为 false：需要处理最小延迟
            if (!startTimeRef.current) {
                // 从未开始过，或者已经被 forceEnd 重置了
                setPending(false);
                return;
            }

            const elapsed = Date.now() - startTimeRef.current;
            const remainingMin = minTimeout - elapsed;

            if (remainingMin <= 0) {
                // 已经超过最小时间，直接结束
                forceEnd();
            } else {
                // 还没有到最小时间，延迟结束
                if (minTimerRef.current) clearTimeout(minTimerRef.current);
                minTimerRef.current = setTimeout(() => {
                    forceEnd();
                }, remainingMin);
            }
        }
    }, [originalPending, maxTimeout, minTimeout, forceEnd]);

    return pending;
}

/**
 * UI pending 控制（带最小和最大超时）
 * @param maxTimeout 最大等待时间(ms)，超时自动结束 pending
 * @param minTimeout 最小保持时间(ms)，即使提前 stop，也会至少等待此时间再结束，防止闪烁
 */
export function usePendingWithTimeout(maxTimeout = 3000, minTimeout = 0) {
    const [pending, setPending] = useState(false);
    const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const minTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number>(0);

    // 统一结束：清除所有定时器，重置 pending
    const finish = useCallback(() => {
        if (maxTimerRef.current) {
            clearTimeout(maxTimerRef.current);
            maxTimerRef.current = null;
        }
        if (minTimerRef.current) {
            clearTimeout(minTimerRef.current);
            minTimerRef.current = null;
        }
        setPending(false);
        startTimeRef.current = 0;
    }, []);

    const start = useCallback(() => {
        // 清除之前可能还在等待的定时器
        if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
        if (minTimerRef.current) clearTimeout(minTimerRef.current);

        startTimeRef.current = Date.now();
        setPending(true);

        // 最大超时定时器
        maxTimerRef.current = setTimeout(() => {
            finish();
        }, maxTimeout);
    }, [maxTimeout, finish]);

    const stop = useCallback(() => {
        if (!startTimeRef.current) return; // 未 start 或已结束

        const elapsed = Date.now() - startTimeRef.current;
        const remainingMin = minTimeout - elapsed;

        if (remainingMin <= 0) {
            // 已经过了最小等待时间，直接结束
            finish();
        } else {
            // 还没到最小时间，设置一个定时器在剩余时间后结束
            if (minTimerRef.current) clearTimeout(minTimerRef.current);
            minTimerRef.current = setTimeout(() => {
                finish();
            }, remainingMin);
        }
    }, [minTimeout, finish]);

    // 清理定时器
    useEffect(() => {
        return () => {
            if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
            if (minTimerRef.current) clearTimeout(minTimerRef.current);
        };
    }, []);

    return { pending, start, stop };
}