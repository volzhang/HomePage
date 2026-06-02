import {createAutoMigrationAtom} from "@/vol_apps/04_persist_atoms/createAtom.ts";
import * as v from 'valibot';

const themeSchema = v.object({
    theme: v.picklist(['light', 'dark'])
})

const themeKey = "theme"
const themeDefault = {theme: "light"} as const

// 测试代码
// localStorage.setItem('theme', JSON.stringify({
//     state: {theme: 'dark'},
//     version: 1.2
// }));

export const useThemeAtom = createAutoMigrationAtom(
    {
        stateSchema: themeSchema,
        initState: themeDefault,
        key: themeKey,
        legacy: "localstorage"
    }
)




