import { useEffect, useState, useCallback } from "react";
import { get, set, del } from "idb-keyval";

interface CacheEntry<T> {
    value: T;
    expiresAt: number; // 过期时间戳，Infinity 表示永不过期
}

export function useIdbCache<T = any>(
    key: string,
    defaultTTL?: number // 毫秒，不传则永不过期
) {
    const [data, setData] = useState<T | undefined>(undefined);

    // 启动时自动读取并校验过期
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const raw = await get<CacheEntry<T>>(key);
            if (cancelled) return;
            if (!raw) {
                setData(undefined);
                return;
            }
            if (Date.now() > raw.expiresAt) {
                await del(key); // 过期自动删除
                setData(undefined);
            } else {
                setData(raw.value);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [key]);

    // 写入值，可指定本次过期时间（覆盖 defaultTTL）
    const setValue = useCallback(
        async (value: T, ttl?: number) => {
            const effectiveTTL = ttl ?? defaultTTL;
            const entry: CacheEntry<T> = {
                value,
                expiresAt: effectiveTTL ? Date.now() + effectiveTTL : Infinity,
            };
            await set(key, entry);
            setData(value);
        },
        [key, defaultTTL]
    );

    // 手动删除
    const remove = useCallback(async () => {
        await del(key);
        setData(undefined);
    }, [key]);

    return [data, setValue, remove] as const;
}