import {useMemo, useEffect, useState, useRef, useCallback} from "react";
import {useBgStore, img} from "./bg_store";
import {
    useBingWallpaperArchive,
    getDateWithOffset,
    type BingWallpaperArchiveJson
} from "@/vol_apps/tanStackQuery/Api_BingWallpaper";
import {useLanguageStore} from "@/vol_apps/language/language_store";
import {setBackground} from "./bg_util";
import {useFileCarousel} from "@/vol_apps/02_hooks/useFileCarousel";
import {blobToString} from "@/vol_apps/tool/a2b/blobToString";
import {get, set} from "idb-keyval";
import {toast} from "sonner";

/**
 * UI pending 控制（带超时）
 */
function usePendingWithTimeout(timeout = 3000) {
    const [pending, setPending] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const start = () => {
        if (timerRef.current) clearTimeout(timerRef.current);

        setPending(true);

        timerRef.current = setTimeout(() => {
            setPending(false);
            timerRef.current = null;
        }, timeout);
    };

    const stop = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setPending(false);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return {pending, start, stop};
}

export type BgLogic = ReturnType<typeof useBgLogic>;
export const useBgLogic = () => {
    const {
        bgImg,
        bgType,
        bgSize,
        bgRepeat,
        bgCenter,
        otherVisible,
        bgUiVisible,
        bgBingDate,
        bgBingCopyright,
        setBgImg,
        setBgType,
        setBgRepeat,
        setBgCenter,
        setBgSize,
        setBgUiVisible,
        setOtherVisible,
        setBgBingDate,
        setBgBingCopyright,
    } = useBgStore();

    const {t, language} = useLanguageStore();

    // 日期
    const date = useMemo(() => bgBingDate ?? getDateWithOffset(), [bgBingDate]);
    const preDate = useMemo(() => getDateWithOffset(date, -1), [date]);
    const nextDate = useMemo(() => getDateWithOffset(date, +1), [date]);
    // console.log(date)

    // 查询
    const {
        wallpaperJson: currentJson,
        wallpaperJpgBase64: currentJpg,
        isPending: currentPending
    } = useBingWallpaperArchive(language, date);

    const {
        wallpaperJson: prevJson,
        wallpaperJpgBase64: prevJpg,
        isPending: prevPending
    } = useBingWallpaperArchive(language, preDate);

    const {
        wallpaperJson: nextJson,
        wallpaperJpgBase64: nextJpg,
        isPending: nextPending
    } = useBingWallpaperArchive(language, nextDate);

    const copyright = (json: BingWallpaperArchiveJson | null) => {
        return json
            ? `${json.title ?? ""} ${json.copyright ?? ""} | ${json.date ?? ""}`
            : ""
    }

    const currentCopyright = useMemo(() => copyright(currentJson), [currentJson]);
    const prevCopyright = useMemo(() => copyright(prevJson), [prevJson]);
    const nextCopyright = useMemo(() => copyright(nextJson), [nextJson]);


    useEffect(() => {
        // fallback：当天没有图 → 自动用前一天
        if (!currentPending && !currentJpg) setBgBingDate(preDate)
        // 新用户的初始值
        if (bgType === "bing" && bgImg === null && currentJpg ) setBgImg(currentJpg)
    }, [currentPending, currentJpg, date]);

    /**
     * bgType 切换
     */

    useEffect(() => {
        const run = async () => {
            if (bgType === "bing" && currentJpg) {
                if (currentJpg !== bgImg) setBgImg(currentJpg);
                if (currentCopyright !== bgBingCopyright) setBgBingCopyright(currentCopyright);

                setBgCenter(true);
                setBgSize("cover");
                setBgRepeat(false);
                return;
            }

            if (bgType === "default") {
                setBgImg(img);
                setBgCenter(false);
                setBgSize("auto");
                setBgRepeat(true);
                return;
            }

            if (bgType === "custom_dir") {
                const h = await get("dh");
                if (!h) {
                    toast.info(t("Please select folder first"));
                    setBgType("custom");
                    return;
                }
                setBgCenter(true);
                setBgSize("contain");
                setBgRepeat(false);
            }
        };
        void run();
    }, [bgType, currentJpg, currentCopyright]);

    /**
     * 应用背景
     */
    useEffect(() => {
        setBackground(bgImg, bgSize, bgRepeat, bgCenter);
    }, [bgImg, bgSize, bgRepeat, bgCenter]);

    /**
     * hide-others
     */
    useEffect(() => {
        document.body.classList.toggle("hide-others", !otherVisible);
        return () => document.body.classList.remove("hide-others");
    }, [otherVisible]);

    /**
     * UI pending（独立于 query）
     */
    const nextCtrl = usePendingWithTimeout(3000);
    const prevCtrl = usePendingWithTimeout(3000);

    /**
     * 用户操作
     */
    const handlePrev = () => {
        if (bgType !== "bing") return;

        prevCtrl.start();
        if (prevJpg) setBgImg(prevJpg);
        setBgBingCopyright(prevCopyright)

        // 让 UI 先响应（关键点）
        setTimeout(() => {
            setBgBingDate(preDate);
        });
    };

    const handleNext = () => {
        if (bgType !== "bing") return;

        nextCtrl.start();
        if (nextJpg) setBgImg(nextJpg);
        setBgBingCopyright(nextCopyright)

        setTimeout(() => {
            setBgBingDate(nextDate);
        });
    };

    /**
     * query 结束 → 终止 UI pending
     */
    useEffect(() => {
        if (!prevPending || prevJpg) prevCtrl.stop();
    }, [prevPending, prevJpg]);

    useEffect(() => {
        if (!nextPending || nextJpg) nextCtrl.stop();
    }, [nextPending, nextJpg]);



    /**
     * 文件夹轮播
     */

    const carouselEnabled = bgType === "custom_dir"

    const handleFile = useCallback(async (f: File) => {
        const i = await blobToString(f)
        setBgImg(i)
    }, [])

    const {setDirHandle} = useFileCarousel({open:carouselEnabled, handle:handleFile, interval:3000})

    const handleDirChange = async () => {
        // @ts-ignore
        const h = await window.showDirectoryPicker()
        const permission = await h.requestPermission({ mode: "read" })
        if (permission !== "granted") {
            toast.error("Permission denied")
            setBgType("custom")
            return
        }
        await set("dh", h)
        setDirHandle(h)
        setBgType("custom_dir")
    }

    const restore = async () => {
        const h = (await get("dh")) as any;
        if (!h) {
            setBgType("custom")
            return
        }
        setDirHandle(h);
    }

    useEffect(() => {
        void restore();
    }, []);


    /**
     * 输出
     */
    return {
        // 新增 文件夹轮播
        handleDirChange,


        bgType,
        bgRepeat,
        bgCenter,
        bgSize,
        otherVisible,
        bgUiVisible,

        setBgType,
        setBgRepeat,
        setBgCenter,
        setBgSize,
        setOtherVisible,
        setBgUiVisible,
        setBgImg,

        bgBingCopyright,

        handleNext,
        handlePrev,

        nextIsPending: nextCtrl.pending,
        prevIsPending: prevCtrl.pending,
        t,
    };
}

