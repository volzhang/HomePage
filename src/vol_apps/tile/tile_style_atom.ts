import type {FontItem} from "@/vol_apps/00_types/Types.ts";
import {initStoreState} from "@/vol_apps/04_persist_atoms";

const FONT_DEFAULT: FontItem = {
    fullName: "System Default",
    family: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif`,
};

export const tileStyleConfig = initStoreState({
    storeName: "ts",
    fields: {
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

        textOffset: {x: 0, y: 8},
        textColor: "#000000",
        textOpacity: 1,
    }
})