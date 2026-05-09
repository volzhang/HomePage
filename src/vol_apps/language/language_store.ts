import {createPersistedStore} from "@/vol_apps/tool/createPersistedStore";

type RESOURCES = {
    en: Record<string, string>;
    cn: Record<string, string>;
}

const resources: RESOURCES = {
    en: {},
    cn: {
        // 直接在这里维护双语显示：k,en_US;v,cn。
        // tile: {
        "Upload Icon": "自定义图标",
        "OK": "确定",

        "Delete Tile": "删除瓷砖",
        "Search Icon": "搜索图标",
        "Fetching Icon": "正在获取图标",

        "No matched tile": "没有匹配的瓷砖",
        "Loading...": "正在加载...",

        // tag: {
        "Click to toggle mode \nCurrently: tiles match ANY selected tags":
            "点击切换模式\n当前：瓷砖匹配 任一 选中标签",

        "Click to toggle mode \nCurrently: tiles match ALL selected tags":
            "点击切换模式\n当前：瓷砖匹配 全部 选中标签",

        "Left-click a tag to select only this one.\nRight-click a tag to open menu for more operations.\nClick me to toggle mode.\nCurrently: tiles match ANY selected tags":
            "左键点击标签，则唯一选中此标签。\n右键点击标签，可打开菜单，支持更多操作。\n点击我切换模式。\n当前：瓷砖匹配 任一 选中标签。",

        "Left-click a tag to select only this one.\nRight-click a tag to open menu for more operations.\nClick me to toggle mode.\nCurrently: tiles match ALL selected tags":
            "左键点击标签，则唯一选中此标签。\n右键点击标签，可打开菜单，支持更多操作。\n点击我切换模式。\n当前：瓷砖匹配 全部 选中标签。",

        "ANY": "任一",
        "ALL": "全部",

        "UntaggedTiles": "无标签瓷砖",
        "Click to sync tags": "同步标签",

        "Toggle selection": "切换状态",
        "Rename": "重命名",

        "Delete": "删除",
        "Delete this tag from tiles": "从所有瓷砖中删除此标签",
        "Delete Tiles with only this tag": "删除所有只有此标签的瓷砖",

        "Delete Untagged Tiles": "删除无标签瓷砖",

        // navigation: {
        "Menu": "菜单",
        "Set Background": "设置背景",

        "Tiles": "瓷砖",
        "Add Tile": "添加瓷砖",
        "Show Tiles": "显示瓷砖",
        "Hide Tiles": "隐藏瓷砖",

        "Backup": "存档",
        "Download Backup": "下载存档",
        "Import Backup": "恢复存档",

        "Chrome/Edge Bookmarks": "Chrome/Edge 书签",
        "Import links from an HTML bookmarks file": "从HTML书签文件中导入",

        "Privacy Policy": "隐私政策",

        // contextMenu: {
        //     "Tiles": "瓷砖",
        //     "Add Tile": "添加瓷砖",
        //     "Show Tiles": "显示瓷砖",
        //     "Hide Tiles": "隐藏瓷砖",
        //
        //     "Backup": "存档",
        //     "Download Backup": "下载存档",
        //     "Import Backup": "恢复存档",
        //     "Set Background": "设置背景",

        // bg: {
        "Please select folder first":"请先选择目录",
        "Permission denied":"已拒绝授权",
        "Image changed":"图片已切换",

        "Double-click to skip to next image during playback.":"播放时，双击可切换至下一张",

        "Random":"随机",
        "Sequential":"顺序",
        "Change every":"切换间隔",
        "sec":"秒",

        "Choose Image": "选择图片",
        "Choose Folder": "选择目录",

        "Bing Wallpaper": "Bing壁纸",
        "Single Image": "自定义单张",
        "Image Carousel": "自定义循环",
        "Reset Defaults": "默认设置",

        "Background Type":"背景类型",
        "Preview":"预览",
        "Position":"位置",
        "Image Size":"图片尺寸",
        // "Images Carousel": "目录循环",

        "Show All": "显示全部",
        "Background Only": "只看背景",
        "Repeat": "重复平铺",
        "Once": "单张",
        "Top Left": "左上角",
        "Center": "居中",
        "Original Size": "原始尺寸",
        "Contain": "扩展至边缘",
        "Cover": "扩展至覆盖",
        // "OK": "确定",
        // "Close":"关闭",

        "Fetching Bing wallpaper": "正在获取Bing壁纸",

        // version: {
        "Version": "版本",

        // codemirror: {
        "Font": "字体",
        "Size": "字号",
        "Weight": "粗细",
        "Line Height": "行高",

        "Line Numbers": "显示行号",
        "No Numbers": "无行号",

        "Word Wrap": "换行显示",
        "No Wrap": "不换行",

        // dndFile: {
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

        // "Download Backup": "下载存档",
        "Restore Backup": "恢复存档",

        "Export Editor content": "导出编辑器内容",
        "Replace & Open": "替换并打开",

        "Cancel": "取消",
        "Continue": "继续",

        // 字体面板
        "search font ...": "搜索字体...",
        "Font List": "字体列表",
        "No font found": "没有匹配字体",

        // 新瓷砖编辑面板

        "Link": "链接",
        "Name": "名字",
        "Tags": "标签",

        "Choose Icon":"选择图标",
        "file:": "文件名：",

        "Fetching": "加载...",

        "Auto-fetch icon": "自动获取图标",
        "Search Bing for icon": "Bing 搜索图标",
        "Tags (space-separated)": "添加标签，用空格分隔",
        "tag1 tag2 tag3 ...": "标签1 标签2 标签3 ...",


        // 新 展示面板

        "Delete This Tile": "删除此瓷砖",
        "Reset Default Styles": "重置样式",
        "Tile Global Styles": "瓷砖全局样式",

        // 新Style设置面板

        "Background": "背景",

        "Background Color": "背景色",
        "Background Opacity": "背景透明度",

        "Size & Radius": "尺寸 & 圆角",

        "Tile Size": "瓷砖 边长",
        "Tile Radius": "瓷砖 圆角",

        "Icon": "图标",

        "Icon Border Size": "图标 外框边长",
        "Icon Border Offset": "图标 外框偏移",

        "Icon Size": "图标 边长",
        "Icon Offset": "图标 偏移",

        // "Font":"字体",
        "Text & Font": "文本 & 字体",

        "Font Size": "字体 大小",
        "Font Weight": "字体 粗细",
        "Text Color": "文本 颜色",
        "Text Opacity": "文本 透明度",
        "Text Offset": "文本 偏移",

        "Outline": "描边",
        "Outline Thickness": "描边 厚度",
        "Outline Color": "描边 颜色",
        "Outline Opacity": "描边 透明度",

        //TILE 上下文惨淡
        "Open in new tab": "新选项卡打开",
        "Open": "打开",
        "Edit": "编辑",

        //语言
        "Language": "语言",
        "Select Language": "选择语言",

        //
        "Using radio streaming may cause the browser to incorrectly mark this page as 'Not fully secure'. This is a browser behavior and does not indicate any real security risk."
            :
            "使用电台播放功能可能会导致浏览器误判本页面为“未完全安全”。这是浏览器的行为提示，并不代表实际存在安全风险。",
    }
} as const;

export type LANGUAGE = "en" | "cn"

type LanguageStoreState = {
    language: LANGUAGE;
}

type LanguageStoreActions = {
    setLanguage: (language: LANGUAGE) => void;
    t: (key: string) => string;
}

type LanguageStore = LanguageStoreState & LanguageStoreActions;

export const useLanguageStore = createPersistedStore<LanguageStore>(
    "language",
    (set, get) => ({
        language: "en",
        setLanguage: (language) => {
            set({language});
            document.documentElement.lang = language === "cn" ? "zh-CN" : "en";
            document.title = language === "cn" ? "主页" : "Home Page";
        },
        t: (key) => {
            return get().language === "en"
                ? resources.en[key] ?? key
                : resources.cn[key] ?? resources.en[key] ?? key
        }
    }),
    {
        storageType: "localStorage",
        onRehydrateStorage: (_state) => (hydratedState) => {
            const language = hydratedState?.language
            document.documentElement.lang = language === "cn" ? "zh-CN" : "en";
            document.title = language === "cn" ? "主页" : "Home Page";
        },
    }
);

export const LanguageIsDefault = document.documentElement.lang === "en"