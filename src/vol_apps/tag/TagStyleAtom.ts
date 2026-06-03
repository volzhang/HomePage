import * as v from 'valibot';
import type {FontItem} from "@/vol_apps/00_types/Types.ts";
import {createAutoMigrationAtom} from "@/vol_apps/04_persist_atoms/createAtom.ts";
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

const FONT_DEFAULT: FontItem = {
    fullName: "System Default",
    family: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif`,
};

const tagStyleInit = {
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

const _useTagStyleAtom = createAutoMigrationAtom({
    key: tagStyleKey,
    initState: tagStyleInit,
    stateSchema: tagStyleSchema,
    legacy: "idb"
})

export const useTagStyleAtom = () => {
    const {state, setState, ...rest} = _useTagStyleAtom();

    const hasChanges = useMemo(() => {
        return JSON.stringify(state) !== JSON.stringify(tagStyleInit);
    }, [state]);

    const reset = () => setState(tagStyleInit);

    return {hasChanges, reset, ...rest};
};