import {useState, useEffect} from "react";
import {useFetchTrace} from "@/vol_apps/02_hooks/http/useFetchTrace.ts";
import {blobToString} from "@/vol_apps/tool/a2b/blobToString.ts";

export const useFetchFavicon = ({
                                    domain,
                                    size = 96,
                                    autoStart = false,
}:{
    domain: string,
    size: number,
    autoStart: boolean
}) => {

    const hostname = domain
        ? new URL(domain).hostname
        : null

    const url = hostname
        ? `https://favicon.vemetric.com/${hostname}?size=${size}`
        : null;

    console.log(url)

    const {trace, start, cancel} = useFetchTrace(url);

    const [currentJpg, setCurrentJpg] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [succeed, setSucceed] = useState(false);

    // 当 domain 或 size 变化时，自动开始请求，并取消上一次请求
    useEffect(() => {
        if (!autoStart) return;

        if (!domain) {
            setIsPending(false);
            setSucceed(false);
            return;
        }

        setIsPending(true);
        void start();

        return () => {
            cancel();
            setIsPending(false);
        };
    }, [domain, size]);

    const {state, status, received, total, file} = trace;
    const percent =
        (total != null && total > 0)
            ? (received / total) * 100
            : 0;

    // 监听请求完成/错误状态，更新本地数据
    useEffect(() => {
        if (state === "error" || state === "aborted") {
            setIsPending(false);
            setSucceed(false);
            return;
        }

        if (state === "done" && status === 200) {
            if (file) {
                blobToString(file)
                    .then((base64) => {
                        setCurrentJpg(base64);
                        console.log(base64);
                        setIsPending(false);
                        setSucceed(true);
                    })
                    .catch((err) => {
                        console.error("Failed to convert favicon blob to base64:", err);
                        setIsPending(false);
                        setSucceed(false);
                    });
            } else {
                setIsPending(false);
                setSucceed(false);
            }
        }
    }, [state, status, file]);

    return {
        currentJpg,
        isPending,
        succeed,
        percent,
        restart: ()=>{
            cancel();
            setIsPending(true);
            void start();
        }
    };
};