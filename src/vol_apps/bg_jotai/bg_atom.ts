import {creatPersist} from "@/vol_apps/atomStorage/atomWithStorage";
import {useAtom} from "jotai";
import default_img from "@/assets/wild_oliva.png";

export type bgSizeType = "auto" | "contain" | "cover" | "custom"

export type bgSizeSliderType = `${number}%`

export const bgSizeSliderInit: bgSizeSliderType = "50%";

export const bgSizeItems: { value: bgSizeType; label: string }[] = [
	{value: "auto", label: "原始尺寸"},
	{value: "contain", label: "扩充至边缘"},
	{value: "cover", label: "扩充至覆盖"},
	{value: "custom", label: "自定义尺寸"}
];

const response = await fetch(default_img);
const blob: Blob = await response.blob();

const atom_bg_img = await creatPersist<Blob>("atom_bg_img", blob);
const atom_bg_only =await creatPersist<Boolean>("atom_bg_only", false);
const atom_bg_repeat =await creatPersist<Boolean>("atom_bg_repeat", true);
const atom_bg_size =await creatPersist<bgSizeType>("atom_bg_size", "auto");
const atom_bg_size_slider =await creatPersist<bgSizeSliderType>("atom_bg_size_slider", bgSizeSliderInit);
const atom_bg_center =await creatPersist<Boolean>("atom_bg_center", false);
const atom_bg_ui =await creatPersist<Boolean>("atom_bg_ui", true);

export function useBgStore() {
	const [bgImg, setBgImg] = useAtom(atom_bg_img)
	const [bgOnly, setBgOnly] = useAtom(atom_bg_only)
	const [bgRepeat, setBgRepeat] = useAtom(atom_bg_repeat)
	const [bgSize, setBgSize] = useAtom(atom_bg_size)
	const [bgSizeSlider, setBgSizeSlider] = useAtom(atom_bg_size_slider)
	const [bgCenter, setBgCenter] = useAtom(atom_bg_center)
	const [bgUi, setBgUi] = useAtom(atom_bg_ui)

	return {
		bgImg, setBgImg,
		bgOnly, setBgOnly,
		bgRepeat, setBgRepeat,
		bgSize, setBgSize,
		bgSizeSlider, setBgSizeSlider,
		bgCenter, setBgCenter,
		bgUi, setBgUi,
	} as const;
}