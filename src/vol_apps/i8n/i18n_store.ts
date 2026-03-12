import {initialLng} from "@/vol_apps/i8n/i18n";
import {createPersistedStore} from "@/vol_apps/tool/createPersistedStore";
import i18n from "i18next";

type I18nStoreState = {
	language: string;
}

type I18nStoreActions = {
	setLanguage: (language: string) => void;
}

type I18nStore = I18nStoreState & I18nStoreActions;

export const useI18nStore = createPersistedStore<I18nStore>(
	"i18n",
	(set,) => ({
		language: initialLng || "en",
		setLanguage: async (language) => {
			await i18n.changeLanguage(language);
			set({language});
			updateDocumentLanguage(language);
		}
	}),
	{
		storageType: "localStorage",
		migrateFromLocalForage: true,
		skipHydration: true,
		//i18n初始化很早，我们手动处理，不依赖加载时的Hydration了。
	}
);

// 工具函数：更新 HTML lang 和页面标题
const updateDocumentLanguage = (language: string) => {
	// 用硬编码，一是避免i18n异步导致的不同步，二是确保正确性。
	document.documentElement.lang = language === 'cn' ? 'zh-CN' : 'en';
	document.title = language === 'cn' ? '主页' : 'Home Page';
};


