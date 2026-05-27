import type {FontItem} from "@/vol_apps/cm/cm_store";
import {createPersistedStoreWithEqualityFn} from "@/vol_apps/tool/createPersistedStore";
import {shallow} from "zustand/vanilla/shallow";

type TagStyleState = {
    visible: boolean,

    height: number,
    radius: number,
    gap: { x: number; y: number },

    backgroundColor: string,
    backgroundOpacity: number,

    textOffset: { x: number; y: number },
    textOpacity: number,
    textColor: string,

    fontSize: number,
    fontWeight: number,
    font: FontItem,
}

type TagStyleAction = {
    setVisible: (visible: TagStyleState["visible"]) => void,

    setHeight: (height: TagStyleState["height"]) => void,
    setRadius: (radius: number) => void,
    setGap: (gap: TagStyleState["gap"]) => void,

    setBackgroundColor: (backgroundColor: TagStyleState["backgroundColor"]) => void,
    setBackgroundOpacity: (backgroundOpacity: TagStyleState["backgroundOpacity"]) => void,

    setTextOffset: (textOffset: TagStyleState["textOffset"]) => void,
    setTextOpacity: (textOpacity: TagStyleState["textOpacity"]) => void,
    setTextColor: (textColor: TagStyleState["textColor"]) => void,

    setFontSize: (fontSize: TagStyleState["fontSize"]) => void,
    setFontWeight: (fontWeight: TagStyleState["fontWeight"]) => void,
    setFont: (font: TagStyleState["font"]) => void,
}

type TagStyleStore = TagStyleState & TagStyleAction;

const FONT_DEFAULT: FontItem = {
    fullName: "System Default",
    family: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif`,
};

const INITIAL_STYLE: TagStyleState = {
    visible: true,

    height: 20,
    radius: 0,
    gap: {x: 16, y: 16},

    backgroundColor: "#ffffff",
    backgroundOpacity: 1,

    textOffset: {x: 0, y: 0},
    textColor: "#000000",
    textOpacity: 1,

    fontSize: 14,
    fontWeight: 400,
    font: FONT_DEFAULT,
};

const useTagStyleStoreBase = createPersistedStoreWithEqualityFn<TagStyleStore>(
    "tagStyle",
    (set,) => ({
        ...INITIAL_STYLE,

        setVisible: (visible) => set({visible}),

        setHeight: (height) => set({height}),
        setRadius: (radius) => set({radius}),
        setGap: (gap) => set({gap}),

        setBackgroundColor: (backgroundColor) => set({backgroundColor}),
        setBackgroundOpacity: (backgroundOpacity) => set({backgroundOpacity}),

        setTextOffset: (textOffset) => set({textOffset}),
        setTextOpacity: (textOpacity) => set({textOpacity}),
        setTextColor: (textColor) => set({textColor}),

        setFontSize: (fontSize) => set({fontSize}),
        setFontWeight: (fontWeight) => set({fontWeight}),
        setFont: (font) => set({font}),
    })
)

export function useTagStyleStore(): TagStyleStore;
export function useTagStyleStore<T>(
    selector: (state: TagStyleStore) => T,
): T;

export function useTagStyleStore(selector?: (state: TagStyleStore) => unknown) {
    if (selector) return useTagStyleStoreBase(selector, shallow);
    return useTagStyleStoreBase((s) => s, shallow);
}
