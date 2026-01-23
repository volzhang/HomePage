import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import {initReactI18next} from "react-i18next";

const resources = {
	en: {
		common: {},
		search: {},
		tile: {},
		navigation: {},
		contextMenu: {},
		bg: {}
	},
	cn: {
		// 直接在这里维护双语显示：k,en;v,cn。
		common: {
			"Language": "语言",
			"Select Language": "选择语言"
		},
		search: {
			"Select Engine": "选择搜索引擎",
		},
		tile: {
			"Upload Icon": "上传图标",
			"Confirm": "确定",

			"Url": "跳转地址",
			"Name": "显示名",
			"Tags (space separated)": "添加标签，用空格分隔",
			"Tag1 Tag2 ...": "标签1 标签2 ..."
		},
		navigation: {
			"Menu": "菜单",

			"Set Background": "设置背景",
			"Download Backup": "下载存档",
			"Restore": "恢复存档",
			"Add Tile": "添加瓷砖",
		},
		contextMenu: {
			"Add Tile": "添加瓷砖",
			"Backup": "存档",
			"Download": "下载",
			"Restore": "上传",
			"Set Background": "设置背景",
		},
		bg: {
			"Upload Image": "上传图片",
			"Normal": "正常",
			"Hide Others": "只看背景",
			"Repeat": "重复平铺",
			"non-Repeat": "单张",
			"Top Left": "左上角",
			"Center": "居中",
			"Default Size": "原始尺寸",
			"Contain": "扩展至边缘",
			"Cover": "扩展至覆盖"
		}
	}
};

await i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		lng: "en",
		fallbackLng: "en",
		interpolation: {escapeValue: false},
		detection: {order: ["localStorage", "navigator"]},
	});

export default i18n;


