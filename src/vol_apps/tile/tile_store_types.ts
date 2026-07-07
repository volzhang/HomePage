import defaultIconBase64 from "@/assets/icon-100.png?inline";

export {defaultIconBase64};

export const defaultTile = {
    id: 0, url: "", meta: {name: "", alt: "", icon: "", tags: [],}
};

const english_tag = "Tutorial_Tiles_(right_click_to_delete_these_tiles)";
const chinese_tag = "教程瓷砖(右键可删除相关瓷砖)"

const tutorialConfig = [
    {name: "Long Press to Drag", alt: "Tutorial: Long press and drag to rearrange tiles", url: "", tag: english_tag},
    {name: "Right-Click Me", alt: "Tutorial: Right-click (desktop) to edit tile", url: "", tag: english_tag},
    {name: "Right-Click Nearby", alt: "Tutorial: Right-click beside the tile to open the context menu", url: "", tag: english_tag},
    {name: "Click Me to Link", alt: "Tutorial: Click the tile to open link in a new tab", url: "https://github.com/volzhang/HomePage", tag: english_tag},
    {name: "长按后可拖动", alt: "长按后可拖动", url: "", tag: chinese_tag},
    {name: "右键点击我", alt: "右键点击我", url: "", tag: chinese_tag},
    {name: "右键点旁边空白", alt: "右键点旁边空白", url: "", tag: chinese_tag},
    {name: "左键点击跳转", alt: "左键点击跳转", url: "https://github.com/volzhang/HomePage", tag: chinese_tag},
];

export const TutorialsTiles: Tile[] = tutorialConfig.map((item, index) => ({
    id: index,
    url: item.url,
    meta: {
        name: item.name,
        alt: item.alt,
        icon: "",
        tags: [item.tag],
    },
}));

export const tutorialTags: Tag[] = [
    {id: 0, name: english_tag, checked: true},
    {id: 1, name: chinese_tag, checked: false},
]

export type Meta = {
    name: string;
    alt: string;
    icon: string;
    tags: string[];

    //新增 为了扩展tile类型，比如 纯组件显示/音乐播放
}

export type Tile = {
    id: number;
    url: string;
    meta: Meta;
}

export type Tag = {
    id: number; //唯一
    name: string;
    checked: boolean;
}

export type TileUpdate = Partial<Omit<Tile, "meta">> & { meta?: Partial<Meta> };