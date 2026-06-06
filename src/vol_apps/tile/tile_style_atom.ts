import * as v from "valibot";
import type {FontItem} from "@/vol_apps/00_types/Types.ts";
import {createMigratePersistAtom} from "@/vol_apps/04_persist_atoms/signal_legacy.ts";

const colorStringSchema = v.pipe(v.string(),
    v.regex(/^#[0-9a-fA-F]{6}$/, '必须是有效的十六进制颜色（如 #ffffff）'))

const tileStyleSchema = v.object({
    backgroundColor: colorStringSchema,
    backgroundOpacity: v.number(),

    tileSize: v.number(),
    tileRadius: v.number(),
    tileOutlineThickness: v.number(),
    tileOutlineColor: colorStringSchema,
    tileOutlineOpacity: v.number(),

    iconBorderSize: v.number(),
    iconBorderOffset: v.object({
        x: v.number(),
        y: v.number()
    }),
    iconSize: v.number(),
    iconOffset: v.object({
        x: v.number(),
        y: v.number()
    }),

    fontSize: v.number(),
    fontWeight: v.number(),
    font: v.object({
        fullName: v.string(),
        family: v.string()
    }),

    textOffset: v.object({
        x: v.number(),
        y: v.number()
    }),
    textColor: colorStringSchema,
    textOpacity: v.number(),
})

const FONT_DEFAULT: FontItem = {
    fullName: "System Default",
    family: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif`,
};

const tileStyleKey = "ts"
export const tileStyleInit = {
    backgroundColor: "#ffffff",
    backgroundOpacity: 1,

    tileSize: 140,
    tileRadius: 14,
    tileOutlineThickness: 0,
    tileOutlineColor: "#000000",
    tileOutlineOpacity: 1,

    iconBorderSize: 100,
    iconBorderOffset: {x: 0, y: 10},
    iconSize: 100,
    iconOffset: {x: 0, y: 0},

    fontSize: 14,
    fontWeight: 500,
    font: FONT_DEFAULT,

    textOffset: {x: 0, y: 10},
    textColor: "#000000",
    textOpacity: 1,
}

export const tileStyleAtom = createMigratePersistAtom({
    key: tileStyleKey,
    stateSchema: tileStyleSchema,
    initState: tileStyleInit,
    legacyDb: "idb",
})

// export const useTileStyleAtom = () => {
//     const {state, setState, ...rest} = _useTileStyleAtom()
//
//     const hasChanges = useMemo(() => {
//         return JSON.stringify(state) !== JSON.stringify(tileStyleInit);
//     }, [state]);
//
//     const reset = () => setState(tileStyleInit);
//
//     return {...rest, hasChanges, reset,} as const
// }