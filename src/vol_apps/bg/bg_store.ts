import {createPersistedStore, LatestStoreVersion} from "@/vol_apps/tool/createPersistedStore";
import img from "@/assets/bg-dark.png?inline";
import type {YYYY_MM_DD} from "@/vol_apps/tanStackQuery/Api_BingWallpaper";

export {img}

export type SizeType = "auto" | "cover" | "contain"
export type BgType =
    |"default"
    | "bing"
    | "custom"
    | "custom_dir"

    type BgStoreState = {
    bgImg: string;
    bgType: BgType
    bgBingCopyright: string;
    bgSize: SizeType;
    bgRepeat: boolean;
    bgCenter: boolean;
    otherVisible: boolean;
    bgUiVisible: boolean;

    //新增，用来记录用户选择
    bgBingDate: YYYY_MM_DD | null;

    carouselRandom: boolean;
    carouselInterval: number;
}

type BgStoreActions = {
    setBgImg: (value: BgStoreState["bgImg"]) => void;
    setBgType: (value: BgStoreState["bgType"]) => void;
    setBgBingCopyright: (value: BgStoreState["bgBingCopyright"]) => void;
    setBgRepeat: (value: BgStoreState["bgRepeat"]) => void;
    setBgCenter: (value: BgStoreState["bgCenter"]) => void;
    setBgSize: (value: BgStoreState["bgSize"]) => void;
    setOtherVisible: (value: BgStoreState["otherVisible"]) => void;
    setBgUiVisible: (value: BgStoreState["bgUiVisible"]) => void;

    //新增
    setBgBingDate: (value: BgStoreState["bgBingDate"]) => void;

    setCarouselRandom: (value: BgStoreState["carouselRandom"]) => void;
    setCarouselInterval: (value: BgStoreState["carouselInterval"]) => void;
}

type BgStore = BgStoreState & BgStoreActions;

const INITIAL_STATE = {
    bgType: "default",          //可以保留
    bgImg: img,                 //核心
    bgBingCopyright: "",        //可以保留
    bgSize: "auto",
    bgRepeat: true,
    bgCenter: false,
    otherVisible: true,
    bgUiVisible: false,         //新增，用来记录用户选择

    //新增
    bgBingDate: null,

    carouselRandom: true,
    carouselInterval: 3,
};

export const useBgStore = createPersistedStore<BgStore>(
    "bg",
    (set) => ({
        ...INITIAL_STATE as BgStoreState,
        setBgImg: (bgImg) => set({bgImg}),
        setBgType: (bgType) => set({bgType}),
        setBgBingCopyright: (bgBingCopyright) => set({bgBingCopyright}),
        setBgSize: (bgSize) => {
            set({bgSize})
        },
        setBgRepeat: (bgRepeat) => set({bgRepeat}),
        setBgCenter: (bgCenter) => set({bgCenter}),

        setOtherVisible: (otherVisible) => set({otherVisible}),
        setBgUiVisible: (bgUiVisible) => set({bgUiVisible}),

        setBgBingDate: (bgBingDate) => set({bgBingDate}),

        setCarouselRandom: (carouselRandom) => set({carouselRandom}),
        setCarouselInterval: (carouselInterval) => set({carouselInterval}),
    }),
    {
        storageType: "idb",
        version: LatestStoreVersion,  //放弃otherVisible持久化，清除垃圾KV
        migrate: (persistedState) => {
            if (!persistedState || typeof persistedState !== "object") return {};
            // 排除 otherVisible, bgUiVisible, 其他垃圾KV
            const {
                otherVisible,
                bgUiVisible,
                ...rest
            } = INITIAL_STATE

            const allowed = new Set(Object.keys(rest));
            return Object.fromEntries(
                Object.entries(persistedState).filter(([key]) => allowed.has(key))
            );
        },
        partialize: (state) => {
            // 排除 otherVisible，bgUiVisible，其余字段全部持久化
            const {otherVisible, bgUiVisible, ...rest} = state;
            return rest;
        },
    }
)

