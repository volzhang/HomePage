import {createLocalStoragePersistedStore} from "@/vol_apps/tool/createPersistedStore";
import i18n from "i18next";

type I18nStoreState = {
	language: string;
}

type I18nStoreActions = {
	setLanguage: (language: string) => void;
}

type I18nStore = I18nStoreState & I18nStoreActions;

export const useI18nStore = createLocalStoragePersistedStore<I18nStore>(
	"i18n",
	(set,) => ({
		language: "en",
		setLanguage: async (language) => {
			await i18n.changeLanguage(language);
			set({language});
			updateDocumentLanguage(language);
		}
	}),
	{
		onRehydrateStorage: () => {
			return async (state) => {
				if (state?.language && state.language !== i18n.language) {
					await i18n.changeLanguage(state.language);
					updateDocumentLanguage(state.language);
					// i18n 比较特殊，需要手动changeLanguage恢复历史设置
				}
			};
		}
	}
);

// 工具函数：更新 HTML lang 和页面标题
const updateDocumentLanguage = (language: string) => {
	// 用硬编码，一是避免i18n异步导致的不同步，二是确保正确性。
	document.documentElement.lang = language === 'cn' ? 'zh-CN' : 'en';
	document.title = language === 'cn' ? '主页' : 'Home Page';
};


