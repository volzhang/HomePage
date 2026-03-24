import {useBgStore} from "@/vol_apps/bg/bg_store";
import {setBackground} from "@/vol_apps/bg/bg_util";
import {useI18nStore} from "@/vol_apps/i8n/i18n_store";
import {apiBingWallpaper} from "@/vol_apps/tool/api/apiBingWallpaper";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

export const useBing = () => {
	const {language} = useI18nStore();
	const {bgBingIndex, bgType, bgSize, bgRepeat, bgCenter,
		setBgImg, setBgBingIndex, setBgBingCopyright, setBgType,
	} = useBgStore();

	const cachedBingRef = useRef({img: "", copyright: "", index: 0,});
	const [isLoading, setIsLoading] = useState(false);

	const mkt = useMemo(() => ({cn: "zh-CN", en: "en-US"}[language]), [language]);

	// 预加载指定索引的 bing_img / copyright
	const preloadBing = useCallback(async (index: number) => {
		setIsLoading(true);
		try {
			const result = mkt ? await apiBingWallpaper(index, mkt) : null;
			cachedBingRef.current = result
				? { img: result.img, copyright: result.copyright, index }
				: { img: "", copyright: "", index };
			if (!result) console.warn(`preloadBing Failure (index=${index})`);
		} catch (err) {
			console.warn(`preloadBing Failure (index=${index})`, err);
			cachedBingRef.current = { img: "", copyright: "", index };
		} finally {
			setIsLoading(false);
		}
	}, [mkt]);

	// use cache（用于切换到 Bing | 点击下一张）
	const consumeCache = useCallback(() => {
		if (!cachedBingRef.current.img || !cachedBingRef.current.copyright) {
			console.log("consumeCache Failure: cache empty");
			return;
		}

		setBgImg(cachedBingRef.current.img);
		setBgBingCopyright(cachedBingRef.current.copyright);
		setBgBingIndex(cachedBingRef.current.index);

		setBgType("bing");

		setBackground(cachedBingRef.current.img, bgSize, bgRepeat, bgCenter);
	}, [bgSize, bgRepeat, bgCenter]);

	const consumeCacheAndReloadBing = async () => {
		consumeCache();
		const nextIndex = (cachedBingRef.current.index + 1) % 8;
		await preloadBing(nextIndex);
	};

	// 注意，需要提前使用
	const reLoadImgToCache = async () => {
		await preloadBing(bgBingIndex);
	};

	// 主要用于 language 切换时
	const refreshCurrentBing = useCallback(async () => {
		await preloadBing(bgBingIndex);
		await consumeCacheAndReloadBing();
	}, [bgBingIndex, language]);

	const isFirstRun = useRef(true);

	// cache 初始化，注意，这是无条件全覆盖初始化。
	useEffect(() => {
		if (bgType === "bing") {
			void refreshCurrentBing(); // 加载当前索引并应用，同时预加载下一张
		} else {
			void preloadBing(bgBingIndex); // 只预加载当前索引，为以后切回 Bing 做准备
		}
	}, []);

	// 语言切换时的更新（首次跳过）
	useEffect(() => {
		if (bgType !== "bing") return;
		if (isFirstRun.current) {
			isFirstRun.current = false;
			return; // 首次挂载时不执行，避免与初始化 effect 重复
		}
		void refreshCurrentBing();
	}, [language]);

	// 点击下一张
	const handleNextBing = useCallback(() => {
		if (isLoading) return;
		void consumeCacheAndReloadBing();
	}, [isLoading]);

	return {
		handleNextBing,
		isLoading,
		consumeCacheAndReloadBing,
		reLoadImgToCache,
	};
};