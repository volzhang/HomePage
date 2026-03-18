import {createPersistedStore} from "@/vol_apps/tool/createPersistedStore";

export type FontItem = { fullName: string; family: string }

type CmStoreState = {
	isVisible: boolean

	doc: string
	name: string
	type: string

	enableLineNumbers: boolean;
	enableLineWrapping: boolean;

	fontPx: number,
	fontWeight: number,
	fontMeta: { fullName: string, family: string },
	fontBase64: string,
}

type CmStoreActions = {
	setIsVisible: (isVisible: boolean) => void,

	setDoc: (doc: CmStoreState["doc"]) => void;
	setName: (name: string) => void;
	setType: (type: string) => void;

	setEnableLineNumbers: (lineNumbers: CmStoreState["enableLineNumbers"]) => void;
	setEnableLineWrapping: (lineWrapping: CmStoreState["enableLineWrapping"]) => void;

	setFontPx: (fontPx: CmStoreState["fontPx"]) => void;
	setFontWeight: (fontWeight: CmStoreState["fontWeight"]) => void;
	setFontMeta: (fontFamily: CmStoreState["fontMeta"]) => void;
	setFontBase64: (fontBase64: CmStoreState["fontBase64"]) => void;
}

type CmStore = CmStoreState & CmStoreActions;

export const useCmStore = createPersistedStore<CmStore>(
	"cm",
	(set) => ({
		isVisible: false,
		doc: "落霞与孤鹜齐飞。\nSunset clouds fly side by side with a solitary duck.",
		name: "document.txt",
		type: ".txt",

		enableLineNumbers: false,
		enableLineWrapping: false,

		fontPx: 32,
		fontWeight: 400,
		fontMeta: {fullName: "monospace", family: "monospace"},
		fontBase64: "",

		setIsVisible: (isVisible) => set({isVisible}),

		setDoc: (doc) => set({doc}),
		setName: (name) => set({name}),
		setType: (type) => set({type}),

		setEnableLineNumbers: (enableLineNumbers) => set({enableLineNumbers}),
		setEnableLineWrapping: (enableLineWrapping) => set({enableLineWrapping}),

		setFontPx: (fontPx) => set({fontPx}),
		setFontWeight: (fontWeight) => set({fontWeight}),
		setFontMeta: (fontMeta) => set({fontMeta}),
		setFontBase64: (fontBase64) => set({fontBase64}),
	})
);