import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import {addBootstrapTask} from "@/vol_apps/bootstrap/bootstrap";

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

            "Left-click a tag to select only this one.\nRight-click a tag to open menu for more operations.\nClick me to toggle mode.\nCurrently: tiles match {{mode}} selected tags":
                "左键点击标签，则唯一选中此标签。\n右键点击标签，可打开菜单，支持更多操作。\n点击我切换模式。\n当前：瓷砖匹配{{mode}}选中标签。",
            "ANY": "任一",
            "ALL": "全部",

            "UntaggedTiles": "无标签瓷砖",
            "Click to sync tags": "同步标签",

            "Toggle selection": "切换状态",
            "Rename": "重命名",

            "Delete": "删除",
            "Delete this tag from tiles":"删除此标签：从所有瓷砖中",
            "Delete Tiles with only this tag":"删除所有瓷砖：若仅包含此标签",

            "Delete Untagged Tiles":"删除无标签瓷砖",
        },
        navigation: {
            "Menu": "菜单",
            "Set Background": "设置背景",

            "Tiles": "瓷砖",
            "Add Tile": "添加瓷砖",
            "Show Tiles": "显示瓷砖",
            "Hide Tiles": "隐藏瓷砖",

            "Backup": "存档",
            "Download Backup": "下载存档",
            "Import Backup": "恢复存档",

            "Chrome/Edge Bookmark": "Chrome/Edge 书签",
            "Import links from bookmark file": "从书签中导入链接",

            "Privacy Policy": "隐私政策"
        },
        contextMenu: {


            "Tiles": "瓷砖",
            "Add Tile": "添加瓷砖",
            "Show Tiles": "显示瓷砖",
            "Hide Tiles": "隐藏瓷砖",

            "Backup": "存档",
            "Download Backup": "下载存档",
            "Import Backup": "恢复存档",
            "Set Background": "设置背景",


        },
        bg: {
            "Upload Image": "上传图片",

            "Reset Defaults": "默认设置",
            "Custom": "自定义",
            "DailyBing": "Bing每日壁纸",

            // "Reset Defaults": "恢复默认设置",
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
        },
        codemirror: {
            "Font": "字体",
            "Size": "字号",
            "Weight": "粗细",
            "Line Height": "行高",

            "Line Numbers": "显示行号",
            "No Numbers": "无行号",

            "Word Wrap": "换行显示",
            "No Wrap": "不换行",
        },
        dndFile: {
            "Waiting for file release": "等待释放文件...",
            "Not a file": "未知内容",
            "Unable to read file": "不支持查看此文件",

            "Detected File:": "检测到文件：",
            "Open in editor?": "打开到编辑器？",
            "Editor content will be replaced.": "编辑器内容会被替换。",
            "Unsaved changes will be lost.": "未保存的内容将丢失。",
            "Export first to avoid loss.": "建议先导出以备份",

            "Detected Backup File:": "检测到存档文件：",
            "Restore this backup?": "恢复此存档？",
            "All data and settings will be overwritten.": "所有数据和设置会被覆盖。",
            "Unsaved data will be lost.": "未保存的数据将丢失。",
            "Download current backup first.": "建议先下载当前备份",

            "Detected Bookmark File:": "检测到书签文件：",
            "Continue?": "是否继续？",
            "This will automatically parse bookmarks: generate tiles and tags.": "将自动解析书签：生成瓷砖和标签。",
            "The parsed data will be appended to your tiles wall.": "解析的数据会追加显示到磁砖墙。",
            "This process will not damage existing data.": "此过程不会损坏已有数据。",

            "Download Backup": "下载存档",
            "Restore Backup": "恢复存档",

            "Export Editor content": "导出编辑器内容",
            "Replace & Open": "替换并打开",

            "Cancel": "取消",
            "Continue": "继续",
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

addBootstrapTask(async () => {
    await i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: initialLng,
            fallbackLng: "en",
            interpolation: { escapeValue: false },
        });
});

// export default i18n;  //已经注册BootstrapTask


