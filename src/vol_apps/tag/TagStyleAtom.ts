import * as v from 'valibot';
import type {FontItem} from "@/vol_apps/00_types/Types.ts";
import {createMigrationAtom} from "@/vol_apps/03_persist_atoms/createAtom.ts";
import {get, createStore} from "idb-keyval";
import {useMemo} from "react";

const tagStyleSchema = v.object({
    visible: v.boolean(),
    height: v.number(),
    radius: v.number(),
    gap: v.object({
        x: v.number(),
        y: v.number(),
    }),
    backgroundColor: v.string(),
    backgroundOpacity: v.number(),
    textOpacity: v.number(),
    textColor: v.string(),
    textPadding: v.object({
        x: v.number(),
        y: v.number(),
    }),
    fontSize: v.number(),
    fontWeight: v.number(),
    font: v.object({
        fullName: v.string(),
        family: v.string(),
    })
});

type TagStyle = v.InferOutput<typeof tagStyleSchema>;

const FONT_DEFAULT: FontItem = {
    fullName: "System Default",
    family: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif`,
};

const tagStyleDefault: TagStyle = {
    visible: true,

    height: 20,
    radius: 8,
    gap: {x: 16, y: 16},

    backgroundColor: "auto",
    backgroundOpacity: 1.01,

    textColor: "auto",
    textOpacity: 1.01,

    textPadding: {x: 16, y: 8},

    fontSize: 14,
    fontWeight: 400,
    font: FONT_DEFAULT,
};

const tagStyleKey = "tagStyle";

const idbStore = createStore("localforage", "keyvaluepairs")

const _useTagStyleAtom = createMigrationAtom<TagStyle>({
    key:tagStyleKey,
    defaultValue:tagStyleDefault,
    schema:tagStyleSchema,

    getLegacy: () => get(tagStyleKey, idbStore),
    version: 2
})

// export const useTagStyleAtom = ()=>{
//     const [tagStyle, setTagStyle, hydrated] = _useTagStyleAtom()
//
//     const updateTagStyle = (partial: Partial<TagStyle>)=>{
//         setTagStyle({
//             ...tagStyle,
//             ...partial,
//         })
//     }
//
//     return {tagStyle, setTagStyle, updateTagStyle, hydrated}
// }

export const useTagStyleAtom = () => {
    const [tagStyle, setTagStyle, hydrated] = _useTagStyleAtom();

    const visible = tagStyle.visible;
    const setVisible = (visible: TagStyle["visible"]) =>
        setTagStyle({ ...tagStyle, visible });

    const height = tagStyle.height;
    const setHeight = (height: TagStyle["height"]) =>
        setTagStyle({ ...tagStyle, height });

    const radius = tagStyle.radius;
    const setRadius = (radius: TagStyle["radius"]) =>
        setTagStyle({ ...tagStyle, radius });

    const gap = tagStyle.gap;
    const setGap = (gap: TagStyle["gap"]) =>
        setTagStyle({ ...tagStyle, gap });

    const backgroundColor = tagStyle.backgroundColor;
    const setBackgroundColor = (backgroundColor: TagStyle["backgroundColor"]) =>
        setTagStyle({ ...tagStyle, backgroundColor });

    const backgroundOpacity = tagStyle.backgroundOpacity;
    const setBackgroundOpacity = (backgroundOpacity: TagStyle["backgroundOpacity"]) =>
        setTagStyle({ ...tagStyle, backgroundOpacity });

    const textOpacity = tagStyle.textOpacity;
    const setTextOpacity = (textOpacity: TagStyle["textOpacity"]) =>
        setTagStyle({ ...tagStyle, textOpacity });

    const textColor = tagStyle.textColor;
    const setTextColor = (textColor: TagStyle["textColor"]) =>
        setTagStyle({ ...tagStyle, textColor });

    const textPadding = tagStyle.textPadding;
    const setTextPadding = (textPadding: TagStyle["textPadding"]) =>
        setTagStyle({ ...tagStyle, textPadding });

    const fontSize = tagStyle.fontSize;
    const setFontSize = (fontSize: TagStyle["fontSize"]) =>
        setTagStyle({ ...tagStyle, fontSize });

    const fontWeight = tagStyle.fontWeight;
    const setFontWeight = (fontWeight: TagStyle["fontWeight"]) =>
        setTagStyle({ ...tagStyle, fontWeight });

    const font = tagStyle.font;
    const setFont = (font: TagStyle["font"]) =>
        setTagStyle({ ...tagStyle, font });

    const hasChanges = useMemo(() => {
        return Object.entries(tagStyleDefault).some(([key, defaultValue]) => {
            const current = (tagStyle as any)[key];
            return JSON.stringify(current) !== JSON.stringify(defaultValue);
        });
    }, [tagStyle]);

    const reset = () =>
        setTagStyle({ ...tagStyleDefault });

    return {
        hydrated,

        visible,
        setVisible,

        height,
        setHeight,

        radius,
        setRadius,

        gap,
        setGap,

        backgroundColor,
        setBackgroundColor,

        backgroundOpacity,
        setBackgroundOpacity,

        textOpacity,
        setTextOpacity,

        textColor,
        setTextColor,

        textPadding,
        setTextPadding,

        fontSize,
        setFontSize,

        fontWeight,
        setFontWeight,

        font,
        setFont,

        hasChanges,
        reset,
    };
};