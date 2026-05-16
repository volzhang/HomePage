// import {type PersistedClient, type Persister, PersistQueryClientProvider} from "@tanstack/react-query-persist-client";
// import {del, get, set} from "idb-keyval";
// import React from "react";
// import {QueryClient, useQuery} from "@tanstack/react-query";
// import type {BingWallpaperArchiveJson} from "@/vol_apps/tanStackQuery/Api_BingWallpaper";
//
// const queryClient = new QueryClient({
//     defaultOptions: {
//         queries: {
//             staleTime: 1000 * 60 * 60 * 12,          //保鲜周期 12h
//             gcTime: 1000 * 60 * 60 * 12,        //清除垃圾周期 12h
//         },
//     },
// });
//
// const idbPersister_key = "BingWallpaperRaw";
// const idbPersister = (key: string): Persister => ({
//     persistClient: async (client: PersistedClient) => {
//         await set(key, client);
//     },
//     restoreClient: async () => {
//         return await get<PersistedClient>(key) ?? undefined;
//     },
//     removeClient: async () => {
//         await del(key);
//     },
// });
//
// export const BingWallpaperArchiveRawProvider = ({children}: { children: React.ReactNode }) => {
//     const persister = idbPersister(idbPersister_key);
//     return (
//         <PersistQueryClientProvider client={queryClient} persistOptions={{persister}}>
//             {children}
//         </PersistQueryClientProvider>
//     );
// };
//
// export type BingWallpaperArchiveRawJson = {
//     title: string | null;
//     caption: string | null;
//     subtitle: string | null;
//     copyright: string | null;
//     description: string | null;
//     date: string;
//     bing_url: string | null;
//     url: string;
// };
//
// type type = "cn" | "en" | "videos"
//
//
// const useBingWallpaperArchiveRawJsonList = (
//     type: type,
//     options?: { enabled?: boolean }
// ) => {
//     const queryKey = ["BingWallpaperArchiveRawJson", type,];
//     const url = `https://bingwallpaper.volzhang.com/${type}`;
//     const queryFn = async (): Promise<BingWallpaperArchiveJson[]> => {
//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`json fetch failed: ${res.status}`);
//         return (await res.json());
//     };
//     const { data, isPending, error } = useQuery<BingWallpaperArchiveJson[]>({
//         queryKey, queryFn, enabled: options?.enabled ?? true,
//     });
//     return { wallpaperJsonList: data, isPending, error };
// };
//
