export const deepEqual = (a: unknown, b: unknown): boolean => {
    if (Object.is(a, b)) return true;
    const isObject = (v: unknown): v is Record<string, unknown> => {
        return typeof v === 'object' && v !== null;
    };
    if (!isObject(a) || !isObject(b)) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;
    const keysBSet = new Set(keysB);
    for (const key of keysA) {
        if (!keysBSet.has(key)) return false;
        const va = a[key];
        const vb = b[key];
        if (Object.is(va, vb)) continue;
        const vaIsObject = isObject(va);
        const vbIsObject = isObject(vb);
        if (vaIsObject && vbIsObject) {
            if (!deepEqual(va, vb)) return false;
        } else {
            return false;
        }
    }
    return true;
};