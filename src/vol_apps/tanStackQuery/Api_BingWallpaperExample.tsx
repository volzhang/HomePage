import {useLanguageStore} from "@/vol_apps/language/language_store";
import {getDateWithOffset, useBingWallpaperArchive} from "@/vol_apps/tanStackQuery/Api_BingWallpaper";
import {BingWallpaperArchiveProvider} from "@/vol_apps/tanStackQuery/Api_BingWallpaper";
import {useEffect, useMemo} from "react";

// const WALLPAPER_DATE = "2026-03-11";
const WALLPAPER_DATE = getDateWithOffset(null,-2)

const BingWallpaperDisplay = () => {
    const {language} = useLanguageStore();
    const {
        wallpaperJson,
        wallpaperJpgBlob,
        isJsonLoading,
        imageUrl,
        error
    } = useBingWallpaperArchive(language, WALLPAPER_DATE);

    // 判断图片来源
    const imageSource = wallpaperJson?.bing_url ? "Bing官方" : "第三方CDN";

    const BlobURL = useMemo(() => {
        if (wallpaperJpgBlob) return URL.createObjectURL(wallpaperJpgBlob);
        return null;
    }, [wallpaperJpgBlob]);

    useEffect(() => {
        return () => {
            if (BlobURL) URL.revokeObjectURL(BlobURL);
        };
    }, [BlobURL]);

    if (isJsonLoading) return <div>⏳ 加载中...</div>;
    if (error) return <div>😑 错误: {error.message}</div>;
    if (!wallpaperJson) return <div>😑 无数据</div>;

    return (
        <div>
            {Object.entries(wallpaperJson).map(([key, value]) => (
                <p key={key}>
                    <strong>{key}:</strong> {String(value)}
                </p>
            ))}
            {/* 展示图片：优先使用缓存的 Blob URL，否则使用 bing_url 预览 */}
            { BlobURL ? (
                <div className="w-3/5">
                    <img src={BlobURL} alt={wallpaperJson?.title ?? "壁纸"}/>
                    <p>来源: {imageSource}</p>
                </div>
            ) :
                <div className="w-3/5">
                    <img src={imageUrl} alt={wallpaperJson.title ?? "壁纸"}/>
                    <p>来源: {imageSource}</p>
                </div>
            }
        </div>
    );
};

export const Example = () => {
    return (
        <BingWallpaperArchiveProvider>
            <BingWallpaperDisplay/>
        </BingWallpaperArchiveProvider>
    );
};