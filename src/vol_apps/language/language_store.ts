import {createPersistedStore} from "@/vol_apps/tool/createPersistedStore";
import {useCallback} from "react";
import {type NamespaceDict, resources} from "@/vol_apps/language/language_RESOURCES";

export type LANGUAGE = "en" | "cn";

// ---- 底层 store（只存语言偏好） ----
type LanguageStoreState = { language: LANGUAGE };
type LanguageStoreActions = { setLanguage: (lang: LANGUAGE) => void };

const useRawStore = createPersistedStore<LanguageStoreState & LanguageStoreActions>(
    "language",
    (set) => ({
        language: "en",
        setLanguage: (language) => {
            set({ language });
            document.documentElement.lang = language === "cn" ? "zh-CN" : "en";
            document.title = language === "cn" ? "主页" : "Home Page";
        },
    }),
    {
        storageType: "localStorage",
        onRehydrateStorage: () => (hydratedState) => {
            const lang = hydratedState?.language;
            document.documentElement.lang = lang === "cn" ? "zh-CN" : "en";
            document.title = lang === "cn" ? "主页" : "Home Page";
        },
    }
);


// ---- 自定义 hook（支持可选命名空间） ----
export function useLanguageStore(): {
    language: LANGUAGE;
    setLanguage: (lang: LANGUAGE) => void;
    t: (key: string) => string;
};
export function useLanguageStore(namespace: string): {
    language: LANGUAGE;
    setLanguage: (lang: LANGUAGE) => void;
    t: (key: string) => string;
};

export function useLanguageStore(namespace?: string) {
    const language = useRawStore((s) => s.language);
    const setLanguage = useRawStore((s) => s.setLanguage);

    const t = useCallback(
        (key: string): string => {
            if (!namespace) {
                // 无命名空间：只查顶层直接字符串，找不到返回 key
                const direct = resources[language][key];
                return typeof direct === "string" ? direct : key;
            }
            // 有命名空间：只在该子对象中查找
            const nsContent = resources[language][namespace];
            if (typeof nsContent === "object" && nsContent !== null) {
                return (nsContent as NamespaceDict)[key] ?? key;
            }
            return key;
        },
        [language, namespace]
    );

    return { language, setLanguage, t };
}

export const LanguageIsDefault = document.documentElement.lang === "en";