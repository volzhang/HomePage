import { type PersistedClient, type Persister, PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { del, get, set } from "idb-keyval";
import React from "react";
import { QueryClient, useQuery } from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000*60*60*24*7,
            gcTime: 1000*60*60*24*7,
        },
    },
});

const idbPersister_key = "BingWallpaperArchive";
const idbPersister = (key: string): Persister => ({
    persistClient: async (client: PersistedClient) => { await set(key, client); },
    restoreClient: async () => { return await get<PersistedClient>(key) ?? undefined; },
    removeClient: async () => { await del(key); },
});

export const BingWallpaperArchiveProvider = ({ children }: { children: React.ReactNode }) => {
    const persister = idbPersister(idbPersister_key);
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
            {children}
        </PersistQueryClientProvider>
    );
};

export type BingWallpaperArchiveJson = {
    title: string | null;
    caption: string | null;
    subtitle: string | null;
    copyright: string | null;
    description: string | null;
    date: string;
    bing_url: string | null;
    url: string;
};

type CountryLang = "US-en" | "CN-zh";
type YYYY = "2024" | "2025" | "2026";
type MM = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | `1${0 | 1 | 2}`;
type DD =
    | `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
    | `1${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
    | `2${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
    | `3${0 | 1}`;
export type YYYY_MM_DD = `${YYYY}-${MM}-${DD}`;

type JsonListKey = ["wp_json_list", CountryLang, YYYY, MM];
type JpgUrlKey = ["wp_url_jpg", CountryLang, YYYY_MM_DD];
type JpgBingUrlKey = ["wp_bingUrl_jpg", CountryLang, YYYY_MM_DD];

// 初始包装，保持干净
const useBingWallpaperArchiveJsonList = (
    countryLang: CountryLang,
    Y: YYYY,
    M: MM,
    options?: { enabled?: boolean }
) => {
    const queryKey: JsonListKey = ["wp_json_list", countryLang, Y, M];
    const url = `https://bing.npanuhin.me/${countryLang}.${Y}.${M}.json`;
    const queryFn = async () => {
        const res = await fetch(url);
        return await res.json();
    };
    const { data, isPending, error } = useQuery<BingWallpaperArchiveJson[]>({
        queryKey,
        queryFn,
        enabled: options?.enabled ?? true,
    });
    return { wallpaperJsonList: data, isPending, error };
};

// 二次包装，兼容业务
export const useBingWallpaperArchiveJson = (
    language: "en" | "cn",
    YMD: YYYY_MM_DD,
    options?: { enabled?: boolean }
) => {
    const countryLang = language === "en" ? "US-en" : "CN-zh";
    const [Y, M] = YMD.split("-") as [YYYY, MM];
    const { wallpaperJsonList, isPending, error } = useBingWallpaperArchiveJsonList(
        countryLang,
        Y,
        M,
        options
    );
    const wallpaperJson = wallpaperJsonList?.find(w => w.date === YMD) ?? null;
    return { wallpaperJson, isPending, error };
};

// 固定 URL 的 JPG
const useBingWallpaperArchiveJpg_url = (
    countryLang: CountryLang,
    date: YYYY_MM_DD,
    options?: { enabled?: boolean }
) => {
    const queryKey: JpgUrlKey = ["wp_url_jpg", countryLang, date];
    const [country, lang] = countryLang.split("-");
    const url = `https://bing.npanuhin.me/${country}/${lang}/${date}.jpg`;
    const queryFn = async () => {
        const res = await fetch(url);
        return await res.blob();
    };
    const { data, isPending, error } = useQuery<Blob>({
        queryKey,
        queryFn,
        enabled: options?.enabled ?? true,
    });
    return { wallpaperJpg: data, isPending, error };
};

// 通过 bing_url 获取 JPG（不再内部 throw）
const useBingWallpaperArchiveJpg_BingUrl = (
    countryLang: CountryLang,
    date: YYYY_MM_DD,
    wallpaperJson: BingWallpaperArchiveJson | null,
    options?: { enabled?: boolean }
) => {
    const enabled = options?.enabled ?? !!wallpaperJson?.bing_url;
    const queryKey: JpgBingUrlKey = ["wp_bingUrl_jpg", countryLang, date];
    const queryFn = async () => {
        // enabled 已经保证了 wallpaperJson?.bing_url 存在
        const res = await fetch(wallpaperJson!.bing_url!);
        return await res.blob();
    };
    const { data, isPending, error } = useQuery<Blob>({
        queryKey,
        queryFn,
        enabled,
    });
    return { wallpaperJpg: data, isPending, error };
};

// ========== 统一业务 Hook ==========
export const useBingWallpaperArchive = (
    language: "en" | "cn",
    date: YYYY_MM_DD,
    options?: { enabled?: boolean }
) => {
    const countryLang = language === "en" ? "US-en" : "CN-zh";
    const enabled = options?.enabled ?? true;

    const { wallpaperJson, isPending: isJsonLoading, error: jsonError }
        = useBingWallpaperArchiveJson(language, date, { enabled });

    const useBingUrl = !!wallpaperJson?.bing_url;

    const imageUrl = wallpaperJson?.bing_url ?? wallpaperJson?.url ?? undefined;

    // 2. 图片查询（不会阻塞 JSON 的返回）
    const {
        wallpaperJpg: bingJpg,
        isPending: isBingLoading,
        error: bingError,
    } = useBingWallpaperArchiveJpg_BingUrl(countryLang, date, wallpaperJson, {
        enabled: useBingUrl && !isJsonLoading,
    });

    const {
        wallpaperJpg: fixedJpg,
        isPending: isFixedLoading,
        error: fixedError,
    } = useBingWallpaperArchiveJpg_url(countryLang, date, {
        enabled: !useBingUrl && !isJsonLoading,
    });

    const isImageLoading = isBingLoading || isFixedLoading;
    const wallpaperJpgBlob = bingJpg ?? fixedJpg;
    const error = jsonError || bingError || fixedError;

    return {
        wallpaperJson,
        wallpaperJpgBlob,
        imageUrl,
        isJsonLoading,
        isBingLoading,
        isFixedLoading,
        isImageLoading,
        isPending: isJsonLoading || isBingLoading || isFixedLoading,
        error,
        errors: { jsonError, bingError, fixedError },
        // 当前类 isPending 输出都是有BUG的，会一直显示true，
        // 使用 wallpaperJpgBlob === null && wallpaperJpgBlob === undefined 来暂时顶替
    };
};

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
    const d = date === null
        ? new Date()
        : new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + delta);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}` as YYYY_MM_DD;
};