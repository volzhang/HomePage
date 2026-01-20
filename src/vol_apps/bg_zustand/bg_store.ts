import localforage from "localforage";
import {create} from "zustand";
import defaultImg from "@/assets/wild_oliva.png";
import {persist, createJSONStorage} from "zustand/middleware";
import {type BlobString, blobToString} from "@/vol_apps/tool/isType";

const response = await fetch(defaultImg);
const blob = await response.blob();
const img = await blobToString(blob);

export const defaultSize = "auto";
export const defaultLabel = "原始尺寸";
//以后扩展功能的时候一起处理

export const sizeItems = [
	{value: "auto", label: "原始尺寸"},
	{value: "contain", label: "扩充至边缘"},
	{value: "cover", label: "扩充至覆盖"},
	// {value: "100%", label: "放缩：自定义"},
];

type SizeType = string
// "auto" | "cover" | "contain"
// | `${number}px ${number}px` | `${number}%`;
// 以后再处理，当前够用

type BgStoreState = {
	bgImg: BlobString;
	bgSize: SizeType;
	bgRepeat: boolean;
	bgCenter: boolean;
	otherVisible: boolean;
	bgUiVisible: boolean;
}

type BgStoreActions = {
	setBgImg: (value: BgStoreState["bgImg"]) => void;
	setBgRepeat: (value: BgStoreState["bgRepeat"]) => void;
	setBgCenter: (value: BgStoreState["bgCenter"]) => void;
	setBgSize: (value: BgStoreState["bgSize"]) => void;
	setOtherVisible: (value: BgStoreState["otherVisible"]) => void;
	setBgUiVisible: (value: BgStoreState["bgUiVisible"]) => void;
}

type BgStore = BgStoreState & BgStoreActions;

export const useBgStore = create<BgStore>()(
	persist(
		(set) => ({
			bgImg: img,
			bgSize: "auto",
			bgRepeat: true,
			bgCenter: false,
			otherVisible: true,
			bgUiVisible: false,

			setBgImg: (bgImg) => set({bgImg}),
			setBgSize: (bgSize) => {
				set({bgSize});
				//调试用
			},
			setBgRepeat: (bgRepeat) => set({bgRepeat}),
			setBgCenter: (bgCenter) => set({bgCenter}),

			setOtherVisible: (otherVisible) => set({otherVisible}),
			setBgUiVisible: (bgUiVisible) => set({bgUiVisible}),
		}),
		{
			name: "bg",
			storage: createJSONStorage(() => localforage),
			// partialize: (state) => ({
			// 	bgImg: state.bgImg,
			// 	bgSize: state.bgSize,
			// 	bgRepeat: state.bgRepeat,
			// 	bgCenter: state.bgCenter,
			// }),
		}
	)
);

