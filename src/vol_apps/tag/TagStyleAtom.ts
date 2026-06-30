import {initStoreState} from "@/vol_apps/04_persist_atoms";
import type {FontItem} from "@/vol_apps/00_types/Types.ts";

const FONT_DEFAULT: FontItem = {
    fullName: "System Default",
    family: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif`,
};

export const tagStyleConfig = initStoreState({
    storeName: "tagStyle",
    fields: {
        visible: true,
        radius: 8,
        gap: { x: 16, y: 16 },
        backgroundColor: "auto",
        backgroundOpacity: 1.01,
        textColor: "auto",
        textOpacity: 1.01,
        textPadding: { x: 16, y: 8 },
        fontSize: 14,
        fontWeight: 400,
        font: FONT_DEFAULT,
    }
});
