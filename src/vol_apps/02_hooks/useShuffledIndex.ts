import {useCallback, useEffect, useRef} from "react";

/**
 * 数组索引乱序
 *
 * @param length 数组长度（>= 1），输入0返回0
 * @param random 是否启用随机模式
 *
 * @returns get(index)
 * index 必须为非负整数
 */

export const useShuffledIndex =
    ({
         length,
         random
     }: {
        length: number;
        random: boolean;
    }) => {
        const lengthRef = useRef(length);
        const randomRef = useRef(random);
        lengthRef.current = length;
        randomRef.current = random;

        // 只存当前周期的排列 + 周期号，不再用 Map
        const cache = useRef<{ period: number; arr: number[] } | null>(null);

        // 参数变化时清空
        useEffect(() => {
            cache.current = null;
        }, [length, random]);

        const get = useCallback((index: number) => {
            const len = lengthRef.current;
            if (len <= 0) return 0;

            const period = Math.floor(index / len);
            const offset = index % len;

            if (!randomRef.current) return offset;

            // 如果当前缓存不是这个周期，则生成新排列
            if (!cache.current || cache.current.period !== period) {
                const arr = Array.from({length: len}, (_, i) => i);
                for (let i = len - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                cache.current = {period, arr};
            }

            return cache.current.arr[offset];
        }, []);

        return {get};
    }