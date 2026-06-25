import {useCallback, useRef, useState} from "react";

// fetch 问题通常有3类：
// 1. 网络层，直接catch e
// 2. 服务器，resolved error，构造一个 error，简单维护，
// 3. 数据解析，直接catch e，这个hook中不进入解析阶段，所以不存在

// 锁
// 1.如果请求进程存在，不能发起新的请求，保持请求的单一性，先到先得。
// 2.可通过cancel方法解锁，同时也取消了已存在的进程。

// 缓存-后续再优化
// 1.保存最近一次请求的关键数据，保持无背压，及时释放内存
// 2.使用idbkeyvalue保存，（response元数据和 res.body文件数据，只做备份，不做引用）

type FetchTrace = {
    state: "idle" | "pending" | "success" | "error";
    bodyBlob: Blob | null;
    received: number;
    contentLength: number | null;
    progress: number;
    error: Error | null;
};

const STREAM_THRESHOLD_BYTES = 1024 * 1024;
const UPDATE_RECEIVED_DURATION = 333
const INIT_TRACE: FetchTrace = {
    state: "idle",
    bodyBlob: null,
    received: 0,
    contentLength: null,
    progress: 0,
    error: null,
}

export const useFetchTraceV2 = (url: string | null) => {
        // 锁
        const isFetchingRef = useRef(false);
        // 取消进程
        const abortControllerRef = useRef<AbortController | null>(null);

        const [trace, setTrace] = useState<FetchTrace>(INIT_TRACE);

        const updateTrace = useCallback((trace: Partial<FetchTrace>) => {
            setTrace(prevTrace => ({...prevTrace, ...trace}));
        }, [])

        const start = useCallback(async () => {
            if (!url) return;

            if (isFetchingRef.current) {
                console.warn("Fetch already in progress, skipping...");
                return;
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;
            isFetchingRef.current = true;

            // init/reset
            let received: number = 0;
            let lastSync: number = 0;

            updateTrace({...INIT_TRACE, state: "pending"});

            try {
                // 以下每一步都有可能 catch e

                // URL
                const buildURL = new URL(url);

                // response
                const res = await fetch(buildURL, {signal: controller.signal});
                if (controller.signal.aborted) return;

                // resolved error
                if (!res.ok) {
                    const error = new Error(`ResolvedError ${res.status}: ${res.statusText}`);
                    error.name = "ResolvedError";
                    updateTrace({...INIT_TRACE, state: "error", error});
                    return;
                }

                // resolved

                // try get content-length
                const totalHeader = res.headers.get("content-length");
                const contentLength = totalHeader ? Number(totalHeader) : null
                updateTrace({contentLength});

                // handle bodyBlob
                if (res.body) {

                    // 小文件分支：直接读取
                    // 通常小文件的 totalHeader === null
                    if ((contentLength !== null && contentLength < STREAM_THRESHOLD_BYTES)
                        || (contentLength === null)) {
                        const bodyBlob = await res.blob();
                        if (controller.signal.aborted) return;

                        received = bodyBlob.size;
                        updateTrace({
                            state: "success",
                            bodyBlob, contentLength, received,
                            progress: 100,
                            error: null
                        });
                        return
                    }

                    // 大文件分支：流式读取
                    const reader = res.body.getReader();
                    const chunks: BlobPart[] = [];
                    received = 0

                    while (true) {
                        const {done, value} = await reader.read();
                        if (done) break;
                        if (value) {
                            chunks.push(value);
                            received += value.length;
                        }

                        // update received per UPDATE_RECEIVED_DURATION
                        const now = Date.now();
                        if (now - lastSync > UPDATE_RECEIVED_DURATION) {
                            lastSync = now;
                            const progress = contentLength ? Math.min((received / contentLength) * 100, 100) : 0;
                            updateTrace({received, progress});
                        }
                    }

                    const bodyBlob = new Blob(chunks);
                    if (controller.signal.aborted) return;

                    updateTrace({
                        state: "success",
                        bodyBlob, contentLength,
                        received: bodyBlob.size,
                        progress: 100,
                        error: null
                    });

                } else {
                    updateTrace({
                        state: "success",
                        bodyBlob: null, contentLength, received: 0, progress: 100,
                        error: null
                    });
                }
            } catch (e: any) {

                // cancel
                if (e?.name === "AbortError") {
                    updateTrace({ ...INIT_TRACE, state: "idle" });
                    return;
                }

                // NetworkError
                const error = new Error(e?.message || String(e));
                error.name = e?.name || "Error";
                updateTrace({...INIT_TRACE, state: "error", error});

            } finally {
                isFetchingRef.current = false;
                // clean
                if (abortControllerRef.current === controller) {
                    abortControllerRef.current = null;
                }
            }

        }, [url, updateTrace])

        const cancel = useCallback(() => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        }, []);

        return {trace, start, cancel};
    }
;