import i18n from "i18next";
import localforage from "localforage";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

type I18nStoreState = {
	language: string;
}

type I18nStoreActions = {
	setLanguage: (language: string) => void;
}

type I18nStore = I18nStoreState & I18nStoreActions;

export const useI18nStore = create<I18nStore>()(
	persist(
		(set, _get) => ({
			language: i18n.language || "en",
			setLanguage: async (language) => {
				await i18n.changeLanguage(language);
				set({language});
			}
		}),
		{
			name: "i18n",
			storage: createJSONStorage(() => localforage),
			onRehydrateStorage: () => {
				return async (state) => {
					if (state?.language && state.language !== i18n.language) {
						await i18n.changeLanguage(state.language);
						// i18n 比较特殊，需要手动changeLanguage恢复历史设置
					}
				};
			}
		}
	)
);

