import {type PersistedClient, type Persister, PersistQueryClientProvider} from "@tanstack/react-query-persist-client";
import {del, get, set} from "idb-keyval";
import React from "react";
import {QueryClient, useQuery} from "@tanstack/react-query";
import {type BlobString, blobToString} from "@/vol_apps/tool/a2b/blobToString";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 60 * 24 * 7,
            gcTime: 1000 * 60 * 60 * 24 * 7,
        },
    },
});

const idbPersister_key = "BingWallpaperArchive";
const idbPersister = (key: string): Persister => ({
    persistClient: async (client: PersistedClient) => {
        await set(key, client);
    },
    restoreClient: async () => {
        return await get<PersistedClient>(key) ?? undefined;
    },
    removeClient: async () => {
        await del(key);
    },
});

export const BingWallpaperArchiveProvider = ({children}: { children: React.ReactNode }) => {
    const persister = idbPersister(idbPersister_key);
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{persister}}>
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

type JsonListKey = ["bing_wallpaper", "json_list", CountryLang, YYYY, MM];
type JpgUrlKey = ["bing_wallpaper", "jpg_url", CountryLang, YYYY_MM_DD];
type JpgBingUrlKey = ["bing_wallpaper", "jpg_bingUrl", string];

// 初始包装，保持干净
const useBingWallpaperArchiveJsonList = (
    countryLang: CountryLang,
    Y: YYYY,
    M: MM,
    options?: { enabled?: boolean }
) => {
    const queryKey: JsonListKey = ["bing_wallpaper", "json_list", countryLang, Y, M];
    const url = `https://bing.npanuhin.me/${countryLang}.${Y}.${M}.json`;

    const queryFn = async (): Promise<BingWallpaperArchiveJson[]> => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`json fetch failed: ${res.status}`);
        return (await res.json());
    };

    const { data, isPending, error } = useQuery<BingWallpaperArchiveJson[]>({
        queryKey, queryFn, enabled: options?.enabled ?? true,
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

    const { wallpaperJsonList, isPending, error } =
        useBingWallpaperArchiveJsonList(countryLang, Y, M, options);

    const wallpaperJson = wallpaperJsonList?.find(w => w.date === YMD) ?? null;

    return { wallpaperJson, isPending, error };
};


// ================= JPG（base64） =================

// 第三方 URL
const useBingWallpaperArchiveJpg_url = (
    countryLang: CountryLang,
    date: YYYY_MM_DD,
    options?: { enabled?: boolean }
) => {
    const queryKey: JpgUrlKey = ["bing_wallpaper", "jpg_url", countryLang, date];
    const [country, lang] = countryLang.split("-");
    const url = `https://bing.npanuhin.me/${country}/${lang}/${date}.jpg`;

    const queryFn = async () => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`image fetch failed: ${res.status}`);

        const blob = await res.blob();
        return await blobToString(blob);
    };

    const { data, isPending, error } = useQuery<BlobString>({
        queryKey, queryFn, enabled: options?.enabled ?? true,
    });

    return { wallpaperJpg: data, isPending, error };
};



// Bing官方 bing_url
const useBingWallpaperArchiveJpg_BingUrl = (
    url: string,
    options?: { enabled?: boolean }
) => {
    const enabled = options?.enabled ?? true;
    const queryKey: JpgBingUrlKey = ["bing_wallpaper", "jpg_bingUrl", url]
    const queryFn = async () => {
        const res = await fetch(url!);
        if (!res.ok) throw new Error(`image fetch failed: ${res.status}`);

        const blob = await res.blob();
        return await blobToString(blob);
    };

    const { data, isPending, error } = useQuery<BlobString>({
        queryKey, queryFn, enabled: enabled && !!url,
    });

    return { wallpaperJpg: data, isPending, error };
};

// ================= 业务层 =================
export const useBingWallpaperArchive = (
    language: "en" | "cn",
    date: YYYY_MM_DD,
    options?: { enabled?: boolean }
) => {
    const countryLang = language === "en" ? "US-en" : "CN-zh";
    const enabled = options?.enabled ?? true;

    const {
        wallpaperJson, isPending: isJsonLoading, error: jsonError,
    } = useBingWallpaperArchiveJson(language, date, { enabled });

    const useBingUrl = !!wallpaperJson?.bing_url;

    const bingQuery = useBingWallpaperArchiveJpg_BingUrl(
        wallpaperJson?.bing_url!,
        { enabled: enabled && !!wallpaperJson && useBingUrl }
    );

    const fixedQuery = useBingWallpaperArchiveJpg_url(
        countryLang,
        date,
        { enabled: enabled && !!wallpaperJson && !useBingUrl }
    );

    const activeImageQuery = useBingUrl ? bingQuery : fixedQuery;

    const wallpaperJpgBase64 = activeImageQuery.wallpaperJpg;

    const isImageLoading = !!wallpaperJson && activeImageQuery.isPending;

    const imageError = activeImageQuery.error;

    const imageUrl =
        wallpaperJson?.bing_url ??
        wallpaperJson?.url ??
        undefined;

    const isPending = isJsonLoading || isImageLoading;
    const error = jsonError || imageError;

    return {
        wallpaperJson,
        wallpaperJpgBase64,
        imageUrl,

        isJsonLoading,
        isImageLoading,
        isPending,

        error,
        errors: {
            jsonError,
            bingError: bingQuery.error,
            fixedError: fixedQuery.error,
        },
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