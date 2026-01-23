import i18n from "i18next";
import {create} from "zustand";

type I18nStoreState = {
	language: string;
}

type I18nStoreActions = {
	setLanguage: (language: string) => void;
}

type I18nStore = I18nStoreState & I18nStoreActions;

export const useI18nStore = create<I18nStore>()(
	(set, _get) => ({
		language: i18n.language || "en",
		setLanguage: async (language) => {
			await i18n.changeLanguage(language);
			set({language});
		}
	})
);

