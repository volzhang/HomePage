import {createPersistedStore} from "@/vol_apps/tool/createPersistedStore";
import defaultImg from "@/assets/wild_oliva.png";
import {type BlobString, blobToString} from "@/vol_apps/tool/isType";

const response = await fetch(defaultImg);
const blob = await response.blob();
const img = await blobToString(blob);

// const {t} = useTranslation("bg");

// export const defaultSize = "auto";
// export const defaultLabel = "Default Size";
//以后扩展功能的时候一起处理

// 注意，永远不能吧显示字符放到state中！state只保存后台核心数据！

export const sizeItems = [
	// {value: "auto", label: t("Default Size")},
	// {value: "contain", label: t("Contain")},
	// {value: "cover", label: t("Cover")},

	{value: "auto", label: "Original Size"},
	{value: "contain", label: "Contain"},
	{value: "cover", label: "Cover"},
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

export const useBgStore = createPersistedStore<BgStore>(
	"bg",
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
)

