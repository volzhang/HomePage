// import * as v from 'valibot';
// import {createSignalCfg} from "@/vol_apps/04_persist_atoms/signal";
// import {createMigratePersistAtom} from "@/vol_apps/04_persist_atoms/signal_legacy.ts";

// const tagStyleSchema = v.object({
//     visible: v.boolean(),
//     height: v.number(),
//     radius: v.number(),
//     gap: v.object({
//         x: v.number(),
//         y: v.number(),
//     }),
//     backgroundColor: v.string(),
//     backgroundOpacity: v.number(),
//     textOpacity: v.number(),
//     textColor: v.string(),
//     textPadding: v.object({
//         x: v.number(),
//         y: v.number(),
//     }),
//     fontSize: v.number(),
//     fontWeight: v.number(),
//     font: v.object({
//         fullName: v.string(),
//         family: v.string(),
//     })
// });

import {createStoreConfig} from "@/vol_apps/04_persist_atoms";
import type {FontItem} from "@/vol_apps/00_types/Types.ts";

const FONT_DEFAULT: FontItem = {
    fullName: "System Default",
    family: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif`,
};

// const tagStyleInit = {
//     visible: true,
//
//     radius: 8,
//     gap: {x: 16, y: 16},
//
//     backgroundColor: "auto",
//     backgroundOpacity: 1.01,
//
//     textColor: "auto",
//     textOpacity: 1.01,
//
//     textPadding: {x: 16, y: 8},
//
//     fontSize: 14,
//     fontWeight: 400,
//     font: FONT_DEFAULT,
// };
//
// const tagStyleKey = "tagStyle";
//
// export const tagStyleAtom = createMigratePersistAtom({
//     key: tagStyleKey,
//     initState: tagStyleInit,
//     stateSchema: tagStyleSchema,
//     legacyDb: "idb"
// })

// const createConfig = fieldConfig("tagStyle");
//
// export const tagStyle_visible = createConfig("visible", true);
//
// export const tagStyle_radius = createConfig("radius", 8);
// export const tagStyle_gap = createConfig("gap", { x: 16, y: 16 });
//
// export const tagStyle_backgroundColor = createConfig("backgroundColor", "auto");
// export const tagStyle_backgroundOpacity = createConfig("backgroundOpacity", 1.01);
//
// export const tagStyle_textColor = createConfig("textColor", "auto");
// export const tagStyle_textOpacity = createConfig("textOpacity", 1.01);
//
// export const tagStyle_textPadding = createConfig("textPadding", { x: 16, y: 8 });
//
// export const tagStyle_fontSize = createConfig("fontSize", 14);
// export const tagStyle_fontWeight = createConfig("fontWeight", 400);
// export const tagStyle_font = createConfig("font", FONT_DEFAULT);

export const tagStyleConfig = createStoreConfig({
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
