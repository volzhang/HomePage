import defaultIcon from "@/assets/icon-100.png";
import {blobToString} from "@/vol_apps/tool/a2b/blobToString.js";
const response = await fetch(defaultIcon);
const blob = await response.blob();

export const defaultIconBase64 = await blobToString(blob);

export const defaultTile = {
    id: 0, url: "", meta: {name: "", alt: "", icon: defaultIconBase64, tags: [],}
};

export const TutorialsTiles: Tile[] = [
    {
        id: 0, url: "",
        meta: {
            name: "Long Press to Drag",
            alt: "Tutorial: Long press and drag to rearrange tiles",
            icon: defaultIconBase64,
            tags: ["tutorial", "step1"],
        },
    },
    {
        id: 1, url: "",
        meta: {
            name: "Right-Click Me",
            alt: "Tutorial: Right-click (desktop) to edit tile",
            icon: defaultIconBase64,
            tags: ["tutorial", "step2"],
        },
    },
    {
        id: 2, url: "",
        meta: {
            name: "Right-Click Nearby",
            alt: "Tutorial: Right-click beside the tile to open the context menu",
            icon: defaultIconBase64,
            tags: ["tutorial", "step3"],
        },
    },
    {
        id: 3, url: "https://github.com/volzhang/HomePage",
        meta: {
            name: "Click Me to Link",
            alt: "Tutorial: Click the tile to open link in a new tab",
            icon: defaultIconBase64,
            tags: ["tutorial", "step4"],
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
    id: number; //必须唯一，且尽量等于index
    url: string;
    meta: Meta;
}

export type Tag = {
    id: number; //唯一
    name: string;
    checked: boolean;
}

export type TileUpdate = Partial<Omit<Tile, "meta">> & { meta?: Partial<Meta> };