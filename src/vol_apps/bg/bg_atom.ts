import {createAtom} from "@/vol_apps/atomStorage/atomStorage";
import {useAtom, atom} from "jotai";
import {useEffect} from "react";
import default_img from "@/assets/wild_oliva.png";

export type bgSizeType = "auto" | "contain" | "cover" | "custom"

export type bgSizeSlider = `${number}%`

export const bgSizeSliderInit: bgSizeSlider = "50%";

export const bgSizeItems: { value: bgSizeType; label: string }[] = [
	{value: "auto", label: "原始尺寸"},
	{value: "contain", label: "扩充至边缘"},
	{value: "cover", label: "扩充至覆盖"},
	{value: "custom", label: "自定义尺寸"}
];

const response = await fetch(default_img);
const blob = await response.blob();

const atom_bg_img = await createAtom<Blob>("atom_bg_img", blob);
const atom_bg_only = await createAtom<Boolean>("atom_bg_only", false);
const atom_bg_repeat = await createAtom<Boolean>("atom_bg_repeat", true);
const atom_bg_size = await createAtom<bgSizeType>("atom_bg_size", "auto");
const atom_bg_size_slider = await createAtom<bgSizeSlider>("atom_bg_size_slider", bgSizeSliderInit);

const atom_bg_center = await createAtom<Boolean>("atom_bg_center", false);
const atom_bg_ui = await createAtom<Boolean>("atom_bg_ui", true);

const atom_url = atom<string>("");

export function useBgStore() {
	const [bgImg, setBgImg] = useAtom(atom_bg_img);
	const [bgOnly, setBgOnly] = useAtom(atom_bg_only);
	const [bgRepeat, setBgRepeat] = useAtom(atom_bg_repeat);
	const [bgSize, setBgSize] = useAtom(atom_bg_size);
	const [bgSizeSlider, setBgSizeSlider] = useAtom(atom_bg_size_slider);
	const [bgCenter, setBgCenter] = useAtom(atom_bg_center);
	const [bgUi, setBgUi] = useAtom(atom_bg_ui);

	const [url, setUrl] = useAtom(atom_url); //atom_bg_img是Blob，不能直接给前端用，需要转换

	useEffect(() => {
		if (bgImg) {
			const objectUrl = URL.createObjectURL(bgImg);
			setUrl(objectUrl);
			return () => URL.revokeObjectURL(objectUrl);
		}
	}, [bgImg]);

	return {
		bgImg, setBgImg,
		bgOnly, setBgOnly,
		bgRepeat, setBgRepeat,
		bgSize, setBgSize,
		bgSizeSlider, setBgSizeSlider,
		bgCenter, setBgCenter,
		bgUi, setBgUi,
		url
	} as const;
}