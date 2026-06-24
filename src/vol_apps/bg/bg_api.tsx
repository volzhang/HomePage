import {type Language} from "@/vol_apps/language/useLanguage.ts";
import {useEffect, useState} from "react";
import {blobToString} from "@/vol_apps/tool/a2b/blobToString.ts";
import {useFetchTraceV2} from "@/vol_apps/02_hooks/http/useFetchTraceV2.ts";

type YYYY = "2024" | "2025" | "2026";
type MM = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | `1${0 | 1 | 2}`;
type DD =
    | `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
    | `1${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
    | `2${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
    | `3${0 | 1}`;

export type YYYY_MM_DD = `${YYYY}-${MM}-${DD}`;

/**
 * 获取指定日期偏移后的日期，默认返回当前本地日期
 * @param date - 基准日期 (YYYY-MM-DD)，默认为当前本地日期
 * @param delta - 偏移天数，正数向后，负数向前，默认 0
 * @returns 偏移后的日期字符串 (YYYY-MM-DD)
 */

export const getDateWithOffset = (
    date: YYYY_MM_DD | null = null,
    delta: number = 0
): YYYY_MM_DD => {
    const base = date
        ? new Date(`${date}T00:00:00`)
        : new Date();

    const d = new Date(Date.UTC(
        base.getFullYear(),
        base.getMonth(),
        base.getDate() + delta
    ));

    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}` as YYYY_MM_DD;
};

const baseUrl = "https://bing.npanuhin.me"

const JPGCountryLangMap = {
    en: "US/en",
    cn: "CN/zh"
}
const JSONCountryLangMap = {
    en: "US-en",
    cn: "CN-zh"
}

const buildEndpoint = ({
                           language,
                           date,
                           delta,
                       }: {
    language: Language,
    date?: YYYY_MM_DD,
    delta?: number,
}) => {
    const dateWithOffset = getDateWithOffset(date, delta)
    const jpgCountryLang = JPGCountryLangMap[language];
    const jsonCountryLang = JSONCountryLangMap[language];
    return {
        jpg: `${baseUrl}/${jpgCountryLang}/${dateWithOffset}.jpg`,
        json: `${baseUrl}/${jsonCountryLang}.${dateWithOffset.slice(0, 7).replace("-", ".")}.json`,
    };
}

export const useFetchWallpaper = (props: {
    language: Language;
    date?: YYYY_MM_DD;
    autoStart?: boolean;
}) => {
    const urls = buildEndpoint(props);

    const jsonTrace = useFetchTraceV2(urls.json);
    const jpgTrace = useFetchTraceV2(urls.jpg);

    // 获取数据的内部函数（依赖最新的 trace）
    const getJpgBase64 = async () => {
        if (!jpgTrace.trace.bodyBlob) return null;
        return await blobToString(jpgTrace.trace.bodyBlob);
    };

    const getJson = async () => {
        if (!jsonTrace.trace.bodyBlob) return null;
        const text = await jsonTrace.trace.bodyBlob.text();
        return JSON.parse(text);
    };

    // 本地数据状态
    const [currentJpg, setCurrentJpg] = useState<string | null>(null);
    const [currentJson, setCurrentJson] = useState<any>(null);
    const [isPending, setIsPending] = useState(false);
    const [succeed, setSucceed] = useState(false);

    // 自动启动逻辑
    useEffect(() => {
        if (!props.autoStart) return;

        setIsPending(true);
        void jsonTrace.start();
        void jpgTrace.start();

        return () => {
            setIsPending(false);
            // jsonTrace.cancel();
            // jpgTrace.cancel();
        };
    }, [props.language, props.date, jsonTrace.start, jpgTrace.start, props.autoStart]);

    // console.log('jpgTotal:', jpgTrace.trace.contentLength);
    // console.log('jsonReceived:', jsonTrace.trace.received);
    // console.log('jpgReceived:', jpgTrace.trace.received);

    // 进度计算（
    const jpgTotal = jpgTrace.trace.contentLength;
    const jsonReceived = jsonTrace.trace.received;
    const jpgReceived = jpgTrace.trace.received;
    const rev = jsonReceived + jpgReceived;
    const percent = jpgTotal !== null
        ? (rev / (jsonReceived + jpgTotal)) * 100
        : 0;

    // 统一的状态监听
    useEffect(() => {
        const jsonDone = jsonTrace.trace.state === "idle" && jsonTrace.trace.error === null && jsonTrace.trace.bodyBlob !== null;
        const jpgDone = jpgTrace.trace.state === "idle" && jpgTrace.trace.error === null && jpgTrace.trace.bodyBlob !== null;

        const jsonError = jsonTrace.trace.error && jsonTrace.trace.error.name !== "AbortError";
        const jpgError = jpgTrace.trace.error && jpgTrace.trace.error.name !== "AbortError";

        // 处理错误（任一发生错误即失败）
        if (jsonError || jpgError) {
            setIsPending(false);
            setSucceed(false);
            return;
        }

        // 处理成功（两者都完成且无错误）
        if (jsonDone && jpgDone) {
            Promise.all([getJpgBase64(), getJson()])
                .then(([jpgBase64, jsonData]) => {
                    if (jpgBase64) setCurrentJpg(jpgBase64);
                    if (jsonData) setCurrentJson(jsonData);
                    setIsPending(false);
                    setSucceed(true);
                })
                .catch(() => {
                    setIsPending(false);
                    setSucceed(false);
                });
        }
    }, [
        jsonTrace.trace.state,
        jsonTrace.trace.error,
        jsonTrace.trace.bodyBlob,
        jpgTrace.trace.state,
        jpgTrace.trace.error,
        jpgTrace.trace.bodyBlob,
    ]);

    return {
        // 主要数据
        currentJpg,
        currentJson,
        isPending,
        succeed,
        percent,
    };
};