import {createPersistedStore, LatestStoreVersion} from "@/vol_apps/tool/createPersistedStore";
import img from "@/assets/bg-dark.png?inline"; //得到同步字符串（data URL)
export {img}

// "auto", "cover", "contain"
type SizeType = string
// "default", "custom", "bing"
type BgType = string

type BgStoreState = {
    bgImg: string;
    bgType: BgType
    bgBingIndex: number;
    bgBingCopyright: string;
    bgSize: SizeType;
    bgRepeat: boolean;
    bgCenter: boolean;
    otherVisible: boolean;
    bgUiVisible: boolean;
}

type BgStoreActions = {
    setBgImg: (value: BgStoreState["bgImg"]) => void;
    setBgType: (value: BgStoreState["bgType"]) => void;
    setBgBingIndex: (value: BgStoreState["bgBingIndex"]) => void;
    setBgBingCopyright: (value: BgStoreState["bgBingCopyright"]) => void;
    setBgRepeat: (value: BgStoreState["bgRepeat"]) => void;
    setBgCenter: (value: BgStoreState["bgCenter"]) => void;
    setBgSize: (value: BgStoreState["bgSize"]) => void;
    setOtherVisible: (value: BgStoreState["otherVisible"]) => void;
    setBgUiVisible: (value: BgStoreState["bgUiVisible"]) => void;
}

type BgStore = BgStoreState & BgStoreActions;

const INITIAL_STATE = {
    bgType: "default" as const,
    bgImg: img,
    bgBingIndex: 0,
    bgBingCopyright: "",
    bgSize: "auto",
    bgRepeat: true,
    bgCenter: false,
    otherVisible: true,
    bgUiVisible: false,
};

export const useBgStore = createPersistedStore<BgStore>(
    "bg",
    (set) => ({

        ...INITIAL_STATE,
        setBgImg: (bgImg) => set({bgImg}),
        setBgType: (bgType) => set({bgType}),
        setBgBingIndex: (bgBingIndex) => set({bgBingIndex}),
        setBgBingCopyright: (bgBingCopyright) => set({bgBingCopyright}),
        setBgSize: (bgSize) => {
            set({bgSize})
        },
        setBgRepeat: (bgRepeat) => set({bgRepeat}),
        setBgCenter: (bgCenter) => set({bgCenter}),

        setOtherVisible: (otherVisible) => set({otherVisible}),
        setBgUiVisible: (bgUiVisible) => set({bgUiVisible}),
    }),
    {
        storageType: "localStorage",
        version: LatestStoreVersion,  //放弃otherVisible持久化，清除垃圾KV
        migrate: (persistedState) => {
            if (!persistedState || typeof persistedState !== "object") return {};
            // 排除 otherVisible，其他垃圾KV
            const {
                otherVisible,
                ...rest
            } = INITIAL_STATE

            const allowed = new Set(Object.keys(rest));
            return Object.fromEntries(
                Object.entries(persistedState).filter(([key]) => allowed.has(key))
            );
        },
        partialize: (state) => {
            // 排除 otherVisible，其余字段全部持久化
            const {otherVisible, ...rest} = state;
            return rest;
        }
    }
)

