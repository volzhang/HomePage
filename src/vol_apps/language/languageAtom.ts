import {picklist} from "valibot";
import {createMigrationAtom,} from "@/vol_apps/03_persist_atoms/createAtom.ts";
import {useCallback, useEffect} from "react";
import {type NamespaceDict, resources} from "@/vol_apps/language/language_RESOURCES.ts";
import * as v from 'valibot';

const languageSchema = picklist(['en', 'cn']);
const languageKey = "language"
const languageDefault = "en"

export type LANGUAGE = v.InferOutput<typeof languageSchema>

const _useLanguageAtom = createMigrationAtom<LANGUAGE>({
    key:languageKey,
    defaultValue:languageDefault,
    schema:languageSchema,

    getLegacy:() => localStorage.getItem(languageKey),
})

export const useLanguageAtom = (namespace?: string) => {
    const [language, setLanguage, hydrated] = _useLanguageAtom()

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

    return { language, setLanguage, hydrated, t };
}