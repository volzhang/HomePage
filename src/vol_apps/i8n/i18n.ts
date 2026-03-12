import i18n from "i18next";
import {initReactI18next} from "react-i18next";

const resources = {
	en: {
		common: {},
		search: {},
		tile: {},
		navigation: {},
		contextMenu: {},
		bg: {},
		version: {}
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
			"Upload Icon": "自定义图标",
			"OK": "确定",

			"Link": "跳转地址",
			"Display Name": "显示名",
			"Tags (space-separated)": "添加标签，用空格分隔",
			"tag1 tag2 tag3 ...": "标签1 标签2 标签3 ...",

			"Delete Tile": "删除瓷砖",
			"Search Icon": "搜索图标",
			"Fetching Icon": "正在获取图标",

			"No matched tile": "没有匹配的瓷砖",
			"Loading...": "正在加载..."

		},
		tag: {
			"Click to toggle mode \nCurrently: tiles match {{mode}} selected tags":
				"点击切换模式\n当前：瓷砖匹配{{mode}}选中标签",

			"Left-click a tag to select only this one.\nRight-click to toggle its selection.\nClick me to toggle mode.\nCurrently: tiles match {{mode}} selected tags":
				"左键点击标签，则唯一选中此标签。\n右键点击标签，则切换此标签的选中状态。\n点击我切换模式。\n当前：瓷砖匹配{{mode}}选中标签。",
			"ANY": "任一",
			"ALL": "全部",

			"Untagged": "未标签",
			"Click to sync tags": "同步标签"
		},
		navigation: {
			"Menu": "菜单",

			"Set Background": "设置背景",
			"Download Backup": "下载存档",
			"Import Backup": "恢复存档",
			"Add Tile": "添加瓷砖",

			"Privacy Policy": "隐私政策"
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
			"Reset Defaults": "恢复默认设置",
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
		},
		version: {
			"Version": "版本"
		},
		privacy: {
			"Privacy Policy": "隐私政策"
		}
	}
};

function getInitialLanguage() {
	try {
		const raw = localStorage.getItem("i18n");
		if (!raw) return "en";
		const data = JSON.parse(raw);
		return data?.state?.language || "en";
	} catch {
		return "en";
	}
}

export const initialLng = getInitialLanguage();

await i18n
	.use(initReactI18next)
	.init({
		resources,
		lng: initialLng,
		fallbackLng: "en",
		interpolation: {escapeValue: false},
	});

export default i18n;


