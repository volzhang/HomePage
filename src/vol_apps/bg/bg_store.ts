import {createPersistedStore} from "@/vol_apps/tool/createPersistedStore";
import defaultImg from "@/assets/bg-dark.png";
import {type BlobString, blobToString} from "@/vol_apps/tool/isType";

const response = await fetch(defaultImg);
const blob = await response.blob();
export const img = await blobToString(blob);

type SizeType = string

type BgStoreState = {
	bgImg: BlobString | null;
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
		setBgSize: (bgSize) => {set({bgSize})},
		setBgRepeat: (bgRepeat) => set({bgRepeat}),
		setBgCenter: (bgCenter) => set({bgCenter}),

		setOtherVisible: (otherVisible) => set({otherVisible}),
		setBgUiVisible: (bgUiVisible) => set({bgUiVisible}),
	}),
	{
		storageType: "localStorage",
		migrateFromLocalForage: true,
	}
)

