import {type Ref, useCallback, useRef} from 'react'

function assignRef<T>(ref: Ref<T> | null | undefined, node: T | null) {
    if (typeof ref === 'function') {
        ref(node)
    } else if (ref) {
        ref.current = node
    }
}

export function useMergeRefs<T>(...refs: (Ref<T> | undefined | null)[]) {
    const refsRef = useRef(refs);
    refsRef.current = refs;

    return useCallback((node: T | null) => {
        for (const ref of refsRef.current) {
            assignRef(ref, node);
        }
    }, []);
}