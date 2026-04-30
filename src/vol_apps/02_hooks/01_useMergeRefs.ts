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