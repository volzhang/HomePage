import {cn}         from "@/lib/utils";
import {useBgStore} from "@/vol_apps/bg/bg_store"
import {BgUi} from "@/vol_apps/bg/bg_ui";

export function BgApp() {
	const {
		bgImg,
		bgRepeat, bgSize, bgCenter, otherVisible} = useBgStore();

	const bg = <div
		style={{
			backgroundImage: `url(${bgImg})`,
			// backgroundImage: "none",
		}}
		className={cn(
			"fixed inset-0 opacity-100 bg-background",
			otherVisible ? "-z-1" : "z-1",
			bgRepeat ? "bg-repeat" : "bg-no-repeat",
			{
				"bg-center": bgCenter,
				"bg-auto": bgSize === "auto",
				"bg-contain": bgSize === "contain",
				"bg-cover": bgSize === "cover",
			},
		)}></div>;

	return <>{bg}<BgUi/></>;
}