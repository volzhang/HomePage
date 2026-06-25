import {useMemo, useEffect, useState, useRef, useCallback} from "react";
import {useBgStore, img} from "./bg_store";
import {bgInitState, setBackground} from "./bg_util";
import {useFileCarousel} from "@/vol_apps/02_hooks/useFileCarousel";
import {blobToString} from "@/vol_apps/tool/a2b/blobToString";
import {get, set} from "idb-keyval";
import {toast} from "sonner";
import {useDoubleClick} from "../02_hooks/useDoubleClick";
import {useSettingStore} from "@/vol_apps/settings/setting_store";
import {useUserActivation} from "@/vol_apps/02_hooks/useUserInteracted";
import {useStoreHydrated} from "@/vol_apps/tool/useStoreHydrated.ts";
import {languageConfig, useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {useSignal} from "@/vol_apps/04_persist_atoms/signal";
import {deepEqual} from "@/vol_apps/03_utils/deepEqual.ts";
import {useFetchWallpaper, getDateWithOffset} from "@/vol_apps/bg/bg_api.tsx";
import {useFixedPending} from "@/vol_apps/02_hooks/usePending.ts";
// import {waitForDoubleFrame} from "@/vol_apps/03_utils/waitForDoubleFrame.ts";

export type BgLogic = ReturnType<typeof useBgLogic>;
export const useBgLogic = () => {
    const {
        bgImg,
        bgType,
        bgSize,
        bgRepeat,
        bgCenter,
        otherVisible,
        bgBingDate,
        bgBingCopyright,
        setBgImg,
        setBgType,
        setBgRepeat,
        setBgCenter,
        setBgSize,
        setOtherVisible,
        setBgBingDate,
        setBgBingCopyright,

        carouselRandom, setCarouselRandom,
        carouselInterval, setCarouselInterval,
    } = useBgStore();

    const {open} = useSettingStore()

    useEffect(() => {
        if (!open) setOtherVisible(true);
    }, [open]);

    const {t} = useLanguage("bg");
    const {language} = useSignal(languageConfig("language"))

    // 日期
    const yesterday = getDateWithOffset(undefined, -2)
    const date = useMemo(() => bgBingDate ?? yesterday, [bgBingDate]);
    const preDate = useMemo(() => getDateWithOffset(date, -1), [date]);
    const nextDate = useMemo(() => getDateWithOffset(date, +1), [date]);

    // 需求：
    // 1，首次启动，如果bgBingDate为null，useFetchWallpaper autoStart 为true
    // 2，首次启动后，bgBingDate 变化一次后，useFetchWallpaper autoStart 为true
    // 3，首次启动后，bgType切换为"bing"， useFetchWallpaper autoStart 为true
    // 4，其他时候，首次启动后，useFetchWallpaper autoStart 为 false，避免无意义fetch

    const bgBingDateSnapshotRef = useRef(bgBingDate)
    const bgTypeSnapshotRef = useRef(bgType)

    //1
    const [autoStart, setAutoStart] = useState(() => bgBingDate === null);

    //2
    useEffect(() => {
        if (autoStart) return
        if (bgBingDateSnapshotRef.current !== null && bgBingDate !== bgBingDateSnapshotRef.current)
            setAutoStart(true)
    }, [bgBingDate]);

    //3
    useEffect(() => {
        if (autoStart) return
        if (bgTypeSnapshotRef.current !== "bing" && bgType === "bing")
            setAutoStart(true)
    }, [bgType])

    const {currentJpg, currentJson, isPending, succeed, percent} = useFetchWallpaper({
        language, date, autoStart
    });

    const currentItem = useMemo(() => {
        if (!Array.isArray(currentJson)) return null;
        return currentJson.find((item: any) => item.date === date);
    }, [currentJson, date]);

    // 同步copyrightText 和 bgBingDate
    useEffect(() => {
        if (!isPending && succeed && currentItem) {
            const copyrightText = `${currentItem.title ?? ""} ${currentItem.copyright ?? ""} | ${currentItem.date ?? ""}`;
            setBgBingCopyright(copyrightText);
            setBgBingDate(currentItem.date);
        }
    }, [isPending, currentJpg, currentItem, bgBingCopyright, succeed]);

    const fixedPending = useFixedPending(1000 * 60, 1000 * 2, isPending);

    //////////////////

    /**
     * bgType 切换
     */

    useEffect(() => {
        const run = async () => {
            if (bgType === "bing" && currentJpg) {
                if (currentJpg !== bgImg) setBgImg(currentJpg);
                // if (currentCopyright !== bgBingCopyright) setBgBingCopyright(currentCopyright);

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
    }, [bgType, currentJpg]);

    /**
     * 应用背景
     */
    const hydrated = useStoreHydrated(useBgStore)
    const prevParams = useRef(bgInitState);

    useEffect(() => {
        if (!hydrated) return
        const prev = prevParams.current;
        if (deepEqual(prev, {bgImg, bgSize, bgRepeat, bgCenter})) return

        void setBackground(bgImg, bgSize, bgRepeat, bgCenter);

        prevParams.current = {bgImg, bgSize, bgRepeat, bgCenter};
    }, [bgImg, bgSize, bgRepeat, bgCenter, hydrated]);

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
    // const nextCtrl = usePendingWithTimeout(60*1000, 2000);
    // const prevCtrl = usePendingWithTimeout(60*1000, 2000);

    /**
     * 用户操作
     */
    const handlePrev = async () => {
        if (bgType !== "bing") return;
        setBgBingDate(preDate);
    };

    const handleNext = async () => {
        if (bgType !== "bing") return;
        setBgBingDate(nextDate);
    };

    // /**
    //  * query 结束 → 终止 UI pending
    //  */
    //
    // useEffect(() => {
    //     if (!isPending || currentJpg) prevCtrl.stop();
    //     if (!isPending || currentJpg) nextCtrl.stop();
    // }, [isPending, currentJpg]);

    /**
     * 文件夹轮播
     */

    const carouselEnabled = bgType === "custom_dir"

    const handleFile = useCallback(async (f: File) => {
        const i = await blobToString(f)
        setBgImg(i)
    }, [])

    const {setDirHandle, handleNext: handleNextImage} = useFileCarousel({
        open: carouselEnabled,
        handle: handleFile,
        interval: carouselInterval * 1000, //秒转毫秒
        random: carouselRandom,
        accept: "IMAGE",
        onHandleErr: () => {
            toast.error(t("Custom carousel permission expired. Please select a folder again."))
            setBgType("custom")
        }
    })

    const handleNextImg = async () => {

        try {
            handleNextImage();
            toast.success(t("Image changed"));
        } catch {
            // 已经由 onHandleErr 处理
        }
    }

    //只在两个位置触发：root空白 + 瓷砖墙间隙
    useDoubleClick({
        open: carouselEnabled,
        handle: handleNextImg,
        containerSelector: ["#root", "#tiles_beside", 'body', 'html'],
    })

    const handleDirChange = async () => {
        // @ts-ignore
        const h = await window.showDirectoryPicker()
        const permission = await h.requestPermission({mode: "read"})
        if (permission !== "granted") {
            toast.error("Permission denied")
            setBgType("custom")
            return
        }
        await set("dh", h)
        setDirHandle(h)
        setBgType("custom_dir")
    }

    const hasUserInteracted = useUserActivation();
    const [pendingRestore, setPendingRestore] = useState<FileSystemDirectoryHandle | null>(null);
    useEffect(() => {
        if (hasUserInteracted && pendingRestore) {
            // @ts-ignore
            pendingRestore.requestPermission({mode: "read"}).then((permission) => {
                if (permission === "granted") {
                    setDirHandle(pendingRestore);
                    // toast.success(t("Folder permission restored."));
                } else {
                    toast.error(t("Custom carousel permission expired. Please select a folder again."));
                    setBgType("custom");
                }
                setPendingRestore(null);
            }).catch(() => {
                // toast.error(t("Failed to restore permission."));
                toast.error(t("Custom carousel permission expired. Please select a folder again."));
                setBgType("custom");
                setPendingRestore(null);
            });
        }
    }, [hasUserInteracted, pendingRestore]);

    const restore = async () => {
        const storedHandle = (await get("dh")) as FileSystemDirectoryHandle | null;

        if (!storedHandle && bgType === "custom_dir") {
            toast.error("Please select folder first");
            setBgType("custom");
            return;
        }
        if (!storedHandle) return;

        try {
            // @ts-ignore
            const permissionState = await storedHandle.queryPermission({mode: "read"});
            if (permissionState === "granted") setDirHandle(storedHandle);
            else if (permissionState === "prompt") setPendingRestore(storedHandle);
            else {
                await set("dh", null);
                if (bgType === "custom_dir") {
                    toast.error(t("Custom carousel permission expired. Please select a folder again."));
                    setBgType("custom");
                }
            }
        } catch (err) {
            // console.error("Restore folder error", err);
            await set("dh", null);
            if (bgType === "custom_dir") {
                // toast.error(t("Failed to restore folder permission. Please select again."));
                toast.error(t("Custom carousel permission expired. Please select a folder again."));
                setBgType("custom");
            }
        }
    };

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

        setBgType,
        setBgRepeat,
        setBgCenter,
        setBgSize,
        setOtherVisible,
        setBgImg,

        carouselInterval, setCarouselInterval,
        carouselRandom, setCarouselRandom,

        bgBingCopyright,
        bgBingDate,

        handleNext,
        handlePrev,

        percent, isPending,
        fixedPending,
        t,
    };
}

