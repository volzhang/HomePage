import {useCallback, useRef, useState} from "react";

type HttpState =
    | "idle"
    | "connecting"
    | "headers"
    | "loading"
    | "done"
    | "error"
    | "aborted";

export type FetchTrace = {
    state: HttpState;
    url: string | null;
    status: number | null;
    headers: Record<string, string> | null;
    received: number;
    total: number | null;
    file: Blob | null;
    startedAt: number;
    endedAt: number | null;
    error: Error | null;
};

export const useFetchTrace = (url: string | null) => {
    const abortRef = useRef<AbortController | null>(null);
    const lastSyncRef = useRef(0);
    const requestIdRef = useRef(0);

    const [trace, setTrace] = useState<FetchTrace>({
        state: "idle",
        url,
        status: null,
        headers: null,
        received: 0,
        total: null,
        file: null,
        startedAt: 0,
        endedAt: null,
        error: null
    });

    const start = useCallback(async () => {
        if (!url) return;

        lastSyncRef.current = 0;
        abortRef.current?.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        const startedAt = Date.now();

        let received = 0;

        const requestId = ++requestIdRef.current;
        const safeUpdate = (
            patch: Partial<FetchTrace>
        ) => {
            if (requestId !== requestIdRef.current) return;
            setTrace(prev => ({
                ...prev,
                ...patch,
            }));
        };

        safeUpdate({
            state: "connecting",
            url,
            status: null,
            headers: null,
            received: 0,
            total: null,
            file: null,
            startedAt,
            endedAt: null,
            error: null,
        });

        try {
            const res = await fetch(url, {
                signal: controller.signal,
            });

            if (!res.ok) {
                safeUpdate({
                    state: "error",
                    status: res.status,
                    error: new Error(`HTTP ${res.status}: ${res.statusText}`),
                    endedAt: Date.now(),
                });
                return;
            }

            const headersObj: Record<string, string> = {};
            res.headers.forEach((v, k) => {
                headersObj[k] = v;
            });

            safeUpdate({
                state: "headers",
                status: res.status,
                headers: headersObj,
            });

            const totalHeader = res.headers.get("content-length");
            const total = totalHeader ? Number(totalHeader) : null;

            const reader = res.body?.getReader();

            // 没有响应体，直接完成
            if (!reader) {
                safeUpdate({
                    state: "done",
                    received: 0,
                    total,
                    file: null,
                    endedAt: Date.now(),
                });
                return;
            }

            // 有 body 才进入 loading 状态
            safeUpdate({state: "loading", total});

            const chunks: BlobPart[] = [];
            while (true) {
                const {done, value} = await reader.read();
                if (done) break;

                if (value) {
                    chunks.push(value);
                    received += value.length;
                }

                const now = Date.now();
                if (now - lastSyncRef.current > 250) {
                    lastSyncRef.current = now;
                    safeUpdate({received});
                }
            }

            const file = new Blob(chunks);

            safeUpdate({
                state: "done",
                received,
                file,
                total,
                endedAt: Date.now(),
            });
        } catch (e: any) {
            safeUpdate({
                state: e?.name === "AbortError" ? "aborted" : "error",
                error: e instanceof Error ? e : new Error(String(e)),
                endedAt: Date.now(),
            });
        } finally {
            if (abortRef.current === controller) {
                abortRef.current = null;
            }
        }
    }, [url]);

    const cancel = () => {
        abortRef.current?.abort();
    }

    return {
        trace,
        start,
        cancel,
    };
}