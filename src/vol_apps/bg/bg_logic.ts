import {useMemo, useEffect, useState} from "react";
import {useBgStore, img} from "./bg_store";
import {useBingWallpaperArchive, getDateWithOffset} from "@/vol_apps/tanStackQuery/Api_BingWallpaper";
import {useLanguageStore} from "@/vol_apps/language/language_store";
import {setBackground} from "./bg_util";
import {useStoreHydrated} from "@/vol_apps/tool/useStoreHydrated";

export function useBgLogic() {
    const {
        bgImg, bgType, bgSize, bgRepeat, bgCenter, otherVisible, bgUiVisible, bgBingDate,
        setBgImg, setBgType, setBgRepeat, setBgCenter, setBgSize, setBgUiVisible, setOtherVisible, setBgBingDate,
    } = useBgStore();
    const {t, language} = useLanguageStore();

    // 日期：当前Bing壁纸的驱动是 bgBingDate, 缓存一张 prevDate 壁纸
    const date = useMemo(() => bgBingDate ?? getDateWithOffset(), [bgBingDate]);
    const preDate = useMemo(() => getDateWithOffset(date, -1), [date]);

    // 壁纸数据
    const {wallpaperJson: currentJson, wallpaperJpgBase64: currentJpg, isPending: currentPending} =
        useBingWallpaperArchive(language, date);
    const {isPending: nextPending} = useBingWallpaperArchive(language, preDate);

    // 自动切换背景类型对应的样式
    useEffect(() => {
        if (bgType === "bing" && currentJpg) {
            setBgImg(currentJpg);
            setBgCenter(true);
            setBgSize("cover");
            setBgRepeat(false);
        } else if (bgType === "default") {
            setBgImg(img);
            setBgCenter(false);
            setBgSize("auto");
            setBgRepeat(true);
        }
    }, [bgType, currentJpg]);

    // 更新 DOM 背景样式
    const hydrated = useStoreHydrated(useBgStore);
    useEffect(() => {
        if (hydrated) {
            if (bgType === "bing" && !currentPending) {
                setBackground(bgImg, bgSize, bgRepeat, bgCenter)
            } else if (bgType !== "bing") {
                setBackground(bgImg, bgSize, bgRepeat, bgCenter)
            }
        }
    }, [hydrated, currentPending, bgImg, bgSize, bgRepeat, bgCenter]);

    // 控制 hide-others 类
    useEffect(() => {
        document.body.classList.toggle("hide-others", !otherVisible);
        return () => document.body.classList.remove("hide-others");
    }, [otherVisible]);

    // 下一张 Bing 壁纸
    const [copyrightIsLoading, setCopyrightIsLoading] = useState(false);

    const handleNextBing = () => {
        if (bgType !== "bing") return;
        setCopyrightIsLoading(true);
        // 让浏览器先绘制
        setTimeout(() => setBgBingDate(preDate));
    };

    useEffect(() => {
        if (!nextPending) setCopyrightIsLoading(false);
    }, [nextPending]);

    // 对外暴露的接口（唯一入口）
    return {
        // 状态
        bgType,
        bgRepeat,
        bgCenter,
        bgSize,
        otherVisible,
        bgUiVisible,
        // 版权信息
        copyright: `${currentJson?.title ?? ""} ${currentJson?.copyright ?? ""} `,
        // 版权信息 加载状态
        copyrightIsLoading: copyrightIsLoading,
        // 动作
        setBgType,
        setBgRepeat,
        setBgCenter,
        setBgSize,
        setOtherVisible,
        setBgUiVisible,
        setBgImg,
        handleNextBing,
        // 国际化
        t,
    };
}