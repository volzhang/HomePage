import {picklist} from "valibot";
import {createMigrationAtom,} from "@/vol_apps/03_persist_atoms/createAtom.ts";

const themeSchema = picklist(['light', 'dark']);
const themeKey = "theme"
const themeDefault = "light"

// 测试代码
// localStorage.setItem('theme', JSON.stringify({
//     state: {theme: 'dark'},
//     version: 1.2
// }));

export const useThemeAtom = createMigrationAtom(
    {
        schema: themeSchema,
        defaultValue: themeDefault,
        key: themeKey,
        getLegacy: () => localStorage.getItem(themeKey),
    }
)



