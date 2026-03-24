import {useBgStore} from "@/vol_apps/bg/bg_store";
import {useBing} from "@/vol_apps/bg/bg_useBing";
import {setBackground} from "@/vol_apps/bg/bg_util";
import {useEffect} from "react";
import {BgUiSetting} from "@/vol_apps/bg/bg_ui_setting";
import {BgUiCopyright} from "@/vol_apps/bg/bg_ui_copyright";

export function BgApp() {
	const {bgImg, bgType, bgSize, bgRepeat, bgCenter, otherVisible, bgBingCopyright} = useBgStore();
	const {isLoading, handleNextBing, consumeCacheAndReloadBing, reLoadImgToCache} = useBing();

	// 自动更新背景样式
	useEffect(
		() => setBackground(bgImg, bgSize, bgRepeat, bgCenter),
		[bgImg, bgSize, bgRepeat, bgCenter]
	);

	// hide-others选项，处理相关css注入
	useEffect(() => {
		document.body.classList.toggle("hide-others", !otherVisible);
		return () => document.body.classList.remove("hide-others");
	}, [otherVisible]);

	return (
		<>
			<BgUiSetting
				consumeCacheAndReloadBing={consumeCacheAndReloadBing}
				reLoadImgToCache={reLoadImgToCache}
			/>
			<BgUiCopyright
				bgType={bgType}
				isLoading={isLoading}
				handleNextBing={handleNextBing}
				bgBingCopyright={bgBingCopyright}
			/>
		</>
	);
}