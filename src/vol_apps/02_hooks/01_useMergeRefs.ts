import { useCallback, useRef } from 'react'

function assignRef<T>(ref: React.Ref<T> | null | undefined, value: T | null) {
    if (typeof ref === 'function') {
        ref(value)
    } else if (ref != null) {
        (ref as { current: T | null }).current = value
    }
}

export function useMergeRefs<T>(...refs: React.Ref<T>[]) {
    const refsRef = useRef(refs)
    refsRef.current = refs

    return useCallback((node: T | null) => {
        for (const ref of refsRef.current) {
            assignRef(ref, node)
        }
    }, [])
}

/**
 * 宽松版 useMergeRefs，允许传入 undefined / null，内部自动跳过。
 */
export function useMergeRefsLoose<T>(...refs: (React.Ref<T> | undefined | null)[]) {
    const refsRef = useRef(refs);
    refsRef.current = refs;

    return useCallback((node: T | null) => {
        for (const ref of refsRef.current) {
            assignRef(ref, node);
        }
    }, []);
}