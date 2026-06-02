import {createAutoMigrationAtom} from "@/vol_apps/04_persist_atoms/createAtom.ts";
import {useCallback, useEffect} from "react";
import {type NamespaceDict, resources} from "@/vol_apps/language/language_RESOURCES.ts";
import * as v from 'valibot';

const languageSchema = v.object({
    language: v.picklist(['en', 'cn'])
})

const languageKey = "language"
const languageDefault = {language: "en"} as const

const useAutoMigrationAtom = createAutoMigrationAtom({
    key: languageKey,
    initState: languageDefault,
    stateSchema: languageSchema,
    legacy: "localstorage"
})

export const useLanguageAtom = (namespace?: string) => {

    const {language, setLanguage, hydrated} = useAutoMigrationAtom()

    useEffect(() => {
        if (!hydrated) return;
        document.documentElement.lang = language === "cn" ? "zh-CN" : "en";
        document.title = language === "cn" ? "主页" : "Home Page";
    }, [language, hydrated])

    // 翻译函数
    const t = useCallback(
        (key: string): string => {
            if (!namespace) {
                // 无命名空间：直接查顶层字符串
                const direct = resources[language][key];
                return typeof direct === "string" ? direct : key;
            }
            // 有命名空间：在命名空间对象中查找
            const nsContent = resources[language][namespace];
            if (typeof nsContent === "object" && nsContent !== null) {
                return (nsContent as NamespaceDict)[key] ?? key;
            }
            return key;
        },
        [language, namespace]
    );

    return {language, setLanguage, hydrated, t};
}