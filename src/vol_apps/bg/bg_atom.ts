import { initStoreState } from "@/vol_apps/04_persist_atoms";
import img from "@/assets/bg-dark.png?inline";
import type { YYYY_MM_DD } from "./bg_api";

export {img}

// 导出类型以便其他模块使用
export type SizeType = "auto" | "cover" | "contain";
export type BgType = "default" | "bing" | "custom" | "custom_dir";

export const bgStore = initStoreState({
    storeName: "bg",
    fields: {
        bgImg: img,
        bgType: "default" as BgType,
        bgBingCopyright: "",
        bgSize: "auto" as SizeType,
        bgRepeat: true,
        bgCenter: false,
        otherVisible: true,
        bgBingDate: null as YYYY_MM_DD | null,
        carouselRandom: true,
        carouselInterval: 3,
    }
});