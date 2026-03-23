import {setBackground} from "@/vol_apps/bg/bg";
import {useBgStore} from "@/vol_apps/bg/bg_store";
import {useI18nStore} from "@/vol_apps/i8n/i18n_store";
import {blobToString} from "@/vol_apps/tool/isType";
import {useCallback, useEffect, useRef, useState} from "react";

export const useBing = () => {
	const {language} = useI18nStore();
	const {
		bgBingIndex, bgType, bgSize, bgRepeat, bgCenter,
		setBgImg, setBgBingIndex, setBgBingCopyright
	} = useBgStore();

	const cachedBingImgRef = useRef<string>("");
	const cachedBingCopyrightRef = useRef<string>("");
	const cachedIndexRef = useRef<number>(0);
	const [isLoading, setIsLoading] = useState(false);

	const mkt = {cn: "zh-CN", en: "en-US"}[language];

	// 预加载指定索引的 bing_img / copyright
	const preloadBing = useCallback(
		async (index: number) => {
			setIsLoading(true);
			const url_img = `https://bing.biturl.top/?resolution=1920&format=image&index=${index}&mkt=${mkt}`;
			const url_copyright = `https://bing.biturl.top/?&index=${index}&mkt=${mkt}`;

			try {
				const [imgRes, copyrightRes] = await Promise.all([
					fetch(url_img),
					fetch(url_copyright)
				]);
				const blob = await imgRes.blob();
				const data = await copyrightRes.json();

				cachedBingImgRef.current = await blobToString(blob);
				cachedBingCopyrightRef.current = data.copyright;
				cachedIndexRef.current = index;

			} catch (err) {
				console.warn(`preloadBing Failure (index=${index})`, err);
				cachedBingImgRef.current = "";
				cachedBingCopyrightRef.current = "";
			} finally {
				setIsLoading(false);
			}
		},
		[language]
	);

	// use cache（用于切换到 Bing | 点击下一张）
	const consumeCache = useCallback(() => {
			if (!cachedBingImgRef.current || !cachedBingCopyrightRef.current) {
				console.log("consumeCache Failure: cache empty");
				return;
			}

			setBgImg(cachedBingImgRef.current);
			setBgBingCopyright(cachedBingCopyrightRef.current);
			setBgBingIndex(cachedIndexRef.current);

			setBackground(cachedBingImgRef.current, bgSize, bgRepeat, bgCenter);
		},
		[bgSize, bgRepeat, bgCenter]
	);

	const consumeCacheAndReloadBing = async () => {
		consumeCache();
		const nextIndex = (cachedIndexRef.current + 1) % 8;
		await preloadBing(nextIndex);
	};

	//注意，需要提前使用
	const reLoadImgToCache = async () => {
		await preloadBing(bgBingIndex)
	};

	// 主要用于language切换时
	const refreshCurrentBing = useCallback(async () => {
		await preloadBing(bgBingIndex);
		await consumeCacheAndReloadBing();
	}, [bgBingIndex, language]);

	const isFirstRun = useRef(true);

	// cache初始化，注意，这是无条件全覆盖初始化。
	useEffect(() => {
		if (bgType === "bing") {
			void refreshCurrentBing();   // 加载当前索引并应用，同时预加载下一张
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
		cachedBingImgRef,
		cachedBingCopyrightRef,
		consumeCache,
		handleNextBing,
		isLoading,
		cachedIndexRef,
		preloadBing,
		consumeCacheAndReloadBing,
		reLoadImgToCache,
	};

};