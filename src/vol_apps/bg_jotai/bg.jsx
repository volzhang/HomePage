import {cn}         from "@/lib/utils";
import {useBgStore} from "@/vol_apps/bg_jotai/bg_atom";
import {Ui}         from "@/vol_apps/bg_jotai/bg_ui";

export function BgApp() {
	const bgStyle = "fixed inset-0 opacity-100 bg-white";
	const {bgOnly, bgRepeat, bgSize, bgImg, bgCenter} = useBgStore();

	const bg = <div
		style={{
			backgroundImage: `url(${URL.createObjectURL(bgImg)})`,
			// ...(bgSize === "custom" ? {backgroundSize: bgSizeSlider} : {}),

		}}
		className={cn(
			bgStyle,
			bgOnly ? "z-1" : "-z-1",
			bgRepeat ? "bg-repeat" : "bg-no-repeat",
			{"bg-center": bgCenter},
			{
				"bg-auto": bgSize === "auto",
				"bg-contain": bgSize === "contain",
				"bg-cover": bgSize === "cover",
			},
		)}></div>;

	return <>{bg}<Ui/></>;
}