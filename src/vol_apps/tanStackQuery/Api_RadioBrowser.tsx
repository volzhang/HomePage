// noinspection SpellCheckingInspection

import {type PersistedClient, type Persister, PersistQueryClientProvider} from "@tanstack/react-query-persist-client";
import {del, get, set} from "idb-keyval";
import React from "react";
import {QueryClient, useQuery} from "@tanstack/react-query";


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // staleTime: 1000 * 60 * 60 * 24,          //保鲜周期 1d
            // gcTime: 1000 * 60 * 60 * 24,        //清除垃圾周期 1d
            staleTime: 1000 * 30,          //保鲜周期 30 s
            gcTime: 1000 * 30,        //清除垃圾周期 30 s
        },
    },
});

const idbPersister_key = "RadioBrowser";
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

export const RadioBrowserProvider = ({children}: { children: React.ReactNode }) => {
    const persister = idbPersister(idbPersister_key);
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{persister}}>
            {children}
        </PersistQueryClientProvider>
    );
};

export type RadioBrowserStationJson = {
    changeuuid: string; // 本次电台信息变更的唯一ID
    stationuuid: string; // 电台唯一ID

    name: string; // 电台名称

    url: string; // 原始流地址（推荐用于播放）
    url_resolved: string; // 解析后的流地址（可能是直连CDN）

    homepage: string; // 电台官网
    favicon: string; // 电台图标（png/jpg）

    tags: string; // 标签（逗号分隔，如 "rock,pop"）

    country: string; // 国家名（已废弃，建议用 countrycode）
    countrycode: string; // 国家代码（ISO 3166-1 alpha-2）

    state: string; // 所在地区（州/省）
    iso_3166_2: string; // 地区代码（ISO 3166-2）

    language: string; // 语言（逗号分隔）
    languagecodes: string; // 语言代码（ISO 639-2）

    votes: number; // 投票数（只增不减）

    lastchangetime: string; // 最后修改时间（YYYY-MM-DD HH:mm:ss）
    lastchangetime_iso8601: string; // 最后修改时间（ISO8601）

    codec: string; // 音频编码（mp3 / aac 等）
    bitrate: number; // 比特率（kbps）

    hls: 0 | 1; // 是否为 HLS 流（1=是，0=否）

    lastcheckok: 0 | 1; // 最近检测是否可用（1=可用）

    lastchecktime: string; // 最近检测时间
    lastchecktime_iso8601: string;

    lastcheckoktime: string; // 最近一次检测成功时间
    lastcheckoktime_iso8601: string;

    lastlocalchecktime: string; // 本服务器最近检测时间
    lastlocalchecktime_iso8601: string;

    clicktimestamp: string; // 最近点击时间
    clicktimestamp_iso8601: string;

    clickcount: number; // 24小时点击数
    clicktrend: number; // 点击趋势（正=上升，负=下降）

    ssl_error: number; // SSL错误（0=正常，1=有错误）

    geo_lat: number; // 纬度
    geo_long: number; // 经度
    geo_distance: number; // 距离（米，需请求带坐标才有）

    has_extended_info?: boolean; // 是否有扩展信息（HTTP header 提供）
};

// 原始包装
const useRadioBrowserStationTopClick = (
    offset?: number,
    limit?: number,
    hidebroken?: boolean,
    options?: { enabled?: boolean },
) => {
    const _offset = offset ?? 0
    const _limit = limit ?? 10
    const _hidebroken = hidebroken ?? true
    const enabled = options?.enabled ?? true;

    const queryKey = ["RadioBrowser", "TopClick", _offset, _limit, _hidebroken];

    const url = "https://all.api.radio-browser.info/json/stations/topclick" +
        `?offset=${_offset}` +
        `&limit=${_limit}` +
        `&hidebroken=${_hidebroken}`;

    const queryFn = async () => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`json fetch failed: ${res.status}`);

        const raw = await res.json() as RadioBrowserStationJson[];

        const isValidStream = (item: RadioBrowserStationJson) => {
            const stream = item.url_resolved || item.url;

            if (!stream) return false;

            if (!stream.startsWith("https://")) return false;

            if (item.lastcheckok !== 1) return false;

            if (!item.codec) return false;

            if (typeof item.bitrate === "number" && item.bitrate <= 0) return false;

            return true;
        };

        return raw
            .filter(isValidStream)
            .map(item => {
                const stream = item.url_resolved || item.url;

                return {
                    ...item,
                    url: stream,
                    favicon: (item.favicon || "").replace(/^http:/, "https:"),
                };
            });
    };

    const {data, isPending, error, refetch} = useQuery<RadioBrowserStationJson[]>({
        queryKey, queryFn, enabled: enabled,
    });

    return {TopClickJsonList: data, isPending, error, refetch};
}

// 二次包装 兼容业务 返回需要的结果
export const useTopClick = (
    index: number,
    offset?: number,
    limit?: number,
    hidebroken?: boolean,
    options?: { enabled?: boolean },
) => {
    const {TopClickJsonList, isPending, error} = useRadioBrowserStationTopClick(offset, limit, hidebroken, options)
    const TopClickJson = TopClickJsonList?.[index] ?? null;
    const data = TopClickJson
        ? {
            stationuuid: TopClickJson.stationuuid,
            url: TopClickJson.url,
            name: TopClickJson.name,
            favicon: TopClickJson.favicon,
            tags: TopClickJson.tags,
            clickcount: TopClickJson.clickcount,
            language: TopClickJson.language,
        }
        : null;

    return {
        TopClickJson: data, isPending, error, JsonListLenth:TopClickJsonList?.length
    }
}