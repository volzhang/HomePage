import defaultIconBase64 from "@/assets/icon-100.png?inline";
export { defaultIconBase64 };

export const defaultTile = {
    id: 0, url: "", meta: {name: "", alt: "", icon: defaultIconBase64, tags: [],}
};

export const TutorialsTiles: Tile[] = [
    {
        id: 0, url: "https://www.bing.com/",
        meta: {
            name: "Long Press to Drag",
            alt: "Tutorial: Long press and drag to rearrange tiles",
            icon: defaultIconBase64,
            tags: ["Tips", "1"],
        },
    },
    {
        id: 1, url: "https://www.bing.com/",
        meta: {
            name: "Right-Click Me",
            alt: "Tutorial: Right-click (desktop) to edit tile",
            icon: defaultIconBase64,
            tags: ["Tips", "2"],
        },
    },
    {
        id: 2, url: "https://www.bing.com/",
        meta: {
            name: "Right-Click Nearby",
            alt: "Tutorial: Right-click beside the tile to open the context menu",
            icon: defaultIconBase64,
            tags: ["Tips", "3"],
        },
    },
    {
        id: 3, url: "https://github.com/volzhang/HomePage",
        meta: {
            name: "Click Me to Link",
            alt: "Tutorial: Click the tile to open link in a new tab",
            icon: defaultIconBase64,
            tags: ["Tips", "4"],
        },
    },
    {
        id: 4, url: "https://www.bing.com/",
        meta: {
            name: "长按后可拖动",
            alt: "长按后可拖动",
            icon: defaultIconBase64,
            tags: ["中文提示", "1"],
        },
    },
    {
        id: 5, url: "https://www.bing.com/",
        meta: {
            name: "右键点击我",
            alt: "右键点击我",
            icon: defaultIconBase64,
            tags: ["中文提示", "2"],
        },
    },
    {
        id: 6, url: "https://www.bing.com/",
        meta: {
            name: "右键点旁边空白",
            alt: "右键点旁边空白",
            icon: defaultIconBase64,
            tags: ["中文提示", "3"],
        },
    },
    {
        id: 7, url: "https://github.com/volzhang/HomePage",
        meta: {
            name: "左键点击跳转",
            alt: "左键点击跳转",
            icon: defaultIconBase64,
            tags: ["中文提示", "4"],
        },
    },
];

export type Meta = {
    name: string;
    alt: string;
    icon: string;
    tags: string[];
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