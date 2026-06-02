export function createDebouncedSet<Args extends any[], R>(
    setFn: (...args: Args) => R,
    ms = 1000
) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastArgs: Args | undefined;

    const debounced = async (...args: Args): Promise<Awaited<R>> => {
        lastArgs = args;
        if (timer) clearTimeout(timer);
        return new Promise<Awaited<R>>((resolve, reject) => {
            timer = setTimeout(() => {
                timer = undefined;
                Promise.resolve(setFn(...args)).then(resolve, reject);
            }, ms);
        });
    };

    debounced.flush = async (): Promise<Awaited<R>> => {
        return Promise.resolve(setFn(...lastArgs!));
    };

    return debounced;
}