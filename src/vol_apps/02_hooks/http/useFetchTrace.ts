import {useCallback, useRef, useState} from "react";

type HttpState =
    | "idle"
    | "connecting"
    | "headers"
    | "loading"
    | "done"
    | "error"
    | "aborted";

type FetchTrace = {
    state: HttpState;
    url: string | null;
    status: number | null;
    headers: Record<string, string> | null;
    received: number;
    total: number | null;
    file: Blob | null;
    startedAt: number;
    endedAt: number | null;
};

export const useFetchTrace = (url: string | null) => {
    const abortRef = useRef<AbortController | null>(null);
    const lastSyncRef = useRef(0);

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
    });

    const sync = (patch: Partial<FetchTrace>) => {
        setTrace((prev) => ({
            ...prev,
            ...patch,
        }));
    };

    const start = useCallback(async () => {
        if (!url) return;

        lastSyncRef.current = 0;
        abortRef.current?.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        const startedAt = Date.now();

        let received = 0;

        sync({
            state: "connecting",
            url,
            status: null,
            headers: null,
            received: 0,
            total: null,
            file: null,
            startedAt,
            endedAt: null,
        });

        try {
            const res = await fetch(url, {
                signal: controller.signal,
            });

            const headersObj: Record<string, string> = {};
            res.headers.forEach((v, k) => {
                headersObj[k] = v;
            });

            sync({
                state: "headers",
                status: res.status,
                headers: headersObj,
            });

            const totalHeader = res.headers.get("content-length");
            const total = totalHeader ? Number(totalHeader) : null;

            const reader = res.body?.getReader();

            // 没有响应体，直接完成
            if (!reader) {
                sync({
                    state: "done",
                    received: 0,
                    total,
                    file: null,
                    endedAt: Date.now(),
                });
                return;
            }

            // 有 body 才进入 loading 状态
            sync({state: "loading", total});

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
                    sync({received});
                }
            }

            const file = new Blob(chunks);

            sync({
                state: "done",
                received,
                file,
                endedAt: Date.now(),
            });
        } catch (e: any) {
            sync({
                state: e?.name === "AbortError" ? "aborted" : "error",
                endedAt: Date.now(),
            });
        } finally {
            abortRef.current = null;
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