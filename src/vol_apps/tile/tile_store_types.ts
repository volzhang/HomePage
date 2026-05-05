import defaultIconBase64 from "@/assets/icon-100.png?inline";
export { defaultIconBase64 };

export const defaultTile = {
    id: 0, url: "", meta: {name: "", alt: "", icon: "", tags: [],}
};

export const TutorialsTiles: Tile[] = [
    {
        id: 0, url: "",
        meta: {
            name: "Long Press to Drag",
            alt: "Tutorial: Long press and drag to rearrange tiles",
            icon: "",
            tags: ["Tips", "1"],
        },
    },
    {
        id: 1, url: "",
        meta: {
            name: "Right-Click Me",
            alt: "Tutorial: Right-click (desktop) to edit tile",
            icon: "",
            tags: ["Tips", "2"],
        },
    },
    {
        id: 2, url: "",
        meta: {
            name: "Right-Click Nearby",
            alt: "Tutorial: Right-click beside the tile to open the context menu",
            icon: "",
            tags: ["Tips", "3"],
        },
    },
    {
        id: 3, url: "https://github.com/volzhang/HomePage",
        meta: {
            name: "Click Me to Link",
            alt: "Tutorial: Click the tile to open link in a new tab",
            icon: "",
            tags: ["Tips", "4"],
        },
    },
    {
        id: 4, url: "",
        meta: {
            name: "长按后可拖动",
            alt: "长按后可拖动",
            icon: "",
            tags: ["中文提示", "1"],
        },
    },
    {
        id: 5, url: "",
        meta: {
            name: "右键点击我",
            alt: "右键点击我",
            icon: "",
            tags: ["中文提示", "2"],
        },
    },
    {
        id: 6, url: "",
        meta: {
            name: "右键点旁边空白",
            alt: "右键点旁边空白",
            icon: "",
            tags: ["中文提示", "3"],
        },
    },
    {
        id: 7, url: "https://github.com/volzhang/HomePage",
        meta: {
            name: "左键点击跳转",
            alt: "左键点击跳转",
            icon: "",
            tags: ["中文提示", "4"],
        },
    },
];

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