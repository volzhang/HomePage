import {createMigrationAtom,} from "@/vol_apps/03_persist_atoms/createAtom.ts";
import * as v from 'valibot';

const themeSchema = v.picklist(['light', 'dark']);
const themeKey = "theme"
const themeDefault = "light"

// 测试代码
// localStorage.setItem('theme', JSON.stringify({
//     state: {theme: 'dark'},
//     version: 1.2
// }));

type Theme = v.InferOutput<typeof themeSchema>

export const useThemeAtom = createMigrationAtom<Theme>(
    {
        schema: themeSchema,
        defaultValue: themeDefault,
        key: themeKey,
        getLegacy: () => localStorage.getItem(themeKey),
    }
)



