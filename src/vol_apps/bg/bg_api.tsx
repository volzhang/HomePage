import {type Language} from "@/vol_apps/language/useLanguage.ts";
import {useEffect, useState} from "react";
import {useFetchTrace} from "@/vol_apps/02_hooks/http/useFetchTrace.ts";
import {blobToString} from "@/vol_apps/tool/a2b/blobToString.ts";

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
    const jsonTrace = useFetchTrace(urls.json);
    const jpgTrace = useFetchTrace(urls.jpg);

    // 获取数据的内部函数（依赖最新的 trace）
    const getJpgBase64 = async () => {
        if (!jpgTrace.trace.file) return null;
        return await blobToString(jpgTrace.trace.file);
    };

    const getJson = async () => {
        if (!jsonTrace.trace.file) return null;
        const text = await jsonTrace.trace.file.text();
        return JSON.parse(text);
    };

    // 本地数据状态
    const [currentJpg, setCurrentJpg] = useState<string | null>(null);
    const [currentJson, setCurrentJson] = useState<any>(null);
    const [isPending, setIsPending] = useState(false);
    const [succeed, setSucceed] = useState(false);

    // 请求控制
    useEffect(() => {
        if (!props.autoStart) return;

        setIsPending(true);
        void jsonTrace.start();
        void jpgTrace.start();
        return () => {
            setIsPending(false);
            jsonTrace.cancel();
            jpgTrace.cancel();
        };
    }, [props.language, props.date]);

    // 监听两个 trace 的完成状态

    // const jsonTot = jsonTrace.trace.total;
    const jpgTot = jpgTrace.trace.total ;
    const rev = jsonTrace.trace.received + jpgTrace.trace.received;
    const percent = jpgTot !== null
            ? (rev / (jsonTrace.trace.received + jpgTot)) * 100
            : 0;

    const jpgState = jpgTrace.trace.state;
    const jsonState = jsonTrace.trace.state;
    const jpgStatus = jpgTrace.trace.status;
    const jsonStatus = jsonTrace.trace.status;

    useEffect(() => {

        if (
            jpgState === 'error' ||
            jpgState === 'aborted' ||
            jsonState === 'error' ||
            jsonState === 'aborted'
        ) {
            console.log(jpgStatus, jsonStatus, succeed)
            setIsPending(false);
            setSucceed(false);
            return;
        }

        if (
            jpgState === 'done'
            && jsonState === 'done'
            && jpgStatus === 200
            && jsonStatus === 200
        ) {
            // 成功获取数据后，替换旧数据
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
    }, [jpgTrace.trace.state, jsonTrace.trace.state, jpgTrace.trace.status, jsonTrace.trace.status]);

    return {
        // 主要数据
        currentJpg,
        currentJson,
        isPending,
        succeed,
        percent,
    };
};