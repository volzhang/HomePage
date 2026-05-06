// hooks/useCallbackRef.ts
import { useRef, useCallback } from "react";

/**
 * 创建一个回调 ref，内部以强类型引用保存 DOM 节点，
 * 对外暴露类型相对宽松的回调 ref，可绑定到任意 HTML 元素。
 *
 * @returns `[callbackRef, internalRef]`
 * - `callbackRef`：可直接赋给元素的 `ref` 属性
 * - `internalRef`：React ref 对象，内部存储真正的 DOM 节点，类型为 `HTMLElement | null`
 */

export const useCallbackRef = <T extends HTMLElement>() => {
    const internalRef = useRef<T | null>(null);

    const callbackRef = useCallback((node: T | null) => {
        internalRef.current = node;
    }, []);

    return [callbackRef, internalRef] as const;
};