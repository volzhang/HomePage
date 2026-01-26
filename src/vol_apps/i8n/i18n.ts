import i18n from "i18next";
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
		// 直接在这里维护双语显示：k,en_US;v,cn。
		common: {
			"Language": "语言",
			"Select Language": "选择语言"
		},
		search: {
			"Select Search Engine": "选择搜索引擎",
		},
		tile: {
			"Upload Icon": "上传图标",
			"OK": "确定",

			"Link": "跳转地址",
			"Display Name": "显示名",
			"Tags (space-separated)": "添加标签，用空格分隔",
			"tag1 tag2 tag3 ...": "标签1 标签2 标签3 ..."
		},
		navigation: {
			"Menu": "菜单",

			"Set Background": "设置背景",
			"Download Backup": "下载存档",
			"Import Backup": "恢复存档",
			"Add Tile": "添加瓷砖",
		},
		contextMenu: {
			"Add Tile": "添加瓷砖",
			"Backup": "存档",
			"Download": "下载",
			"Import": "上传",
			"Set Background": "设置背景",
		},
		bg: {
			"Upload Image": "上传图片",
			"Default View": "正常",
			"Hide Others": "只看背景",
			"Repeat": "重复平铺",
			"Single": "单张",
			"Top Left": "左上角",
			"Center": "居中",
			"Original Size": "原始尺寸",
			"Contain": "扩展至边缘",
			"Cover": "扩展至覆盖",
			"OK": "确定"
		}
	}
};

await i18n
	.use(initReactI18next)
	.init({
		resources,
		lng: "en",
		fallbackLng: "en",
		interpolation: {escapeValue: false},
	});

export default i18n;


