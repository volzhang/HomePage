import {createMigrationAtom,} from "@/vol_apps/03_persist_atoms/createAtom.ts";
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

type Theme = v.InferOutput<typeof themeSchema>

export const _useThemeAtom = createMigrationAtom<Theme>(
    {
        schema: themeSchema,
        defaultValue: themeDefault,
        key: themeKey,
        getLegacy: () => localStorage.getItem(themeKey),
    }
)

export const useThemeAtom = () => {
    const [theme, setTheme, hydrated] = _useThemeAtom()

    return {
        theme: theme.theme,
        setTheme: (theme: "dark" | "light") => setTheme({theme: theme}),
        hydrated,
    }
}



