import {createStoreConfig, getSignal, useSignal} from "@/vol_apps/04_persist_atoms";
import {useCallback} from "react";
import {type NamespaceDict, resources} from "@/vol_apps/language/language_RESOURCES.ts";

type Language = "en" | "cn"
export const languageConfig = createStoreConfig({
    storeName:"language",
    fields:{
        language:"en" as Language,
    }
})

const languageSignal = getSignal(...languageConfig("language"));

const syncLanguage = () => {
    const l = languageSignal.get();
    document.documentElement.lang = l === "cn" ? "zh-CN" : "en";
    document.title = l === "cn" ? "主页" : "Home Page";
};
syncLanguage();
languageSignal.subscribe(syncLanguage)

export const useLanguage = (namespace?: string) => {
    const {language} = useSignal(...languageConfig("language"));
    const t = useCallback(
        (key: string): string => {
            const lang = languageSignal.get();
            const dict = resources?.[lang];
            if (!dict) return key;

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

    return {t};
};