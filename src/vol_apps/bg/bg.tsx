import {useBgStore} from "@/vol_apps/bg/bg_store";
import {setBackground} from "@/vol_apps/bg/bg_util";
import {useEffect, useMemo, useState} from "react";
import {BgUiSetting} from "@/vol_apps/bg/bg_ui_setting";
import {BgUiCopyright} from "@/vol_apps/bg/bg_ui_copyright";
import {getDateWithOffset, useBingWallpaperArchive, type YYYY_MM_DD} from "@/vol_apps/tanStackQuery/Api_BingWallpaper";
import {useLanguageStore} from "@/vol_apps/language/language_store";
import {blobToString} from "@/vol_apps/tool/a2b/blobToString";

export function BgApp() {
	const {
		bgImg, bgType, bgSize, bgRepeat, bgCenter, otherVisible, bgUiVisible, bgBingDate,
		setBgBingDate, setBgType, setBgRepeat, setOtherVisible, setBgCenter, setBgImg, setBgSize, setBgUiVisible,
	} = useBgStore();
	const {t, language} = useLanguageStore()

	// 当前显示的日期（若无选中则取当天）
	const date = useMemo(() => {
		return bgBingDate === null ? getDateWithOffset() : bgBingDate;
	}, [bgBingDate]);

	// 当前壁纸数据
	const { wallpaperJson, wallpaperJpgBlob } = useBingWallpaperArchive(language, date);

	// ----- 预加载下一张 -----
	const [nextDate, setNextDate] = useState<YYYY_MM_DD>(() => getDateWithOffset(date, -1));
	const { wallpaperJpgBlob: nextBlob } = useBingWallpaperArchive(
		language,
		nextDate!,
	);

	// 当前日期变化时，自动设置下一张
	useEffect(() => {
		const next = getDateWithOffset(date, -1);
		setNextDate(next);
	}, [date]);

	// 同步当前壁纸到背景（仅在必应模式下）
	useEffect(() => {
		if (bgType === 'bing' && wallpaperJpgBlob instanceof Blob) {
			blobToString(wallpaperJpgBlob).then(setBgImg).catch(console.error);
		}
	}, [bgType, wallpaperJpgBlob, setBgImg]);

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

	const handleNextBing = () => {
		if (bgType !== 'bing') return;
		if (nextBlob instanceof Blob) {
			blobToString(nextBlob).then(setBgImg).catch(console.error);
			setBgBingDate(nextDate)
		}
		setNextDate(getDateWithOffset(nextDate, -1));
	};

	return (
		<>
			<BgUiSetting
				bgRepeat={bgRepeat}
				bgCenter={bgCenter}
				otherVisible={otherVisible}
				bgUiVisible={bgUiVisible}
				bgSize={bgSize}
				bgType={bgType}
				setBgType={setBgType}
				setBgRepeat={setBgRepeat}
				setOtherVisible={setOtherVisible}
				setBgCenter={setBgCenter}
				setBgImg={setBgImg}
				setBgSize={setBgSize}
				setBgUiVisible={setBgUiVisible}
				wallpaperJpgBlob={wallpaperJpgBlob}
				t={t}
			/>
			<BgUiCopyright
				bgType={bgType}
				isLoading={nextBlob === null || nextBlob === undefined}
				handleNextBing={handleNextBing}
				bgBingCopyright={ `${wallpaperJson?.title ?? ""}` + `${wallpaperJson?.copyright ?? ""}`}
			/>
		</>
	);
}