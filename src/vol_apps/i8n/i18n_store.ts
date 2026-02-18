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
		language: i18n.language || "en",
		setLanguage: async (language) => {
			await i18n.changeLanguage(language);
			set({language});
		}
	}),
	{
		onRehydrateStorage: () => {
			return async (state) => {
				if (state?.language && state.language !== i18n.language) {
					await i18n.changeLanguage(state.language);
					// i18n 比较特殊，需要手动changeLanguage恢复历史设置
				}
			};
		}
	}
);


