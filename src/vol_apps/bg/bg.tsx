import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {img, useBgStore} from "@/vol_apps/bg/bg_store";
import {BgUi} from "@/vol_apps/bg/bg_ui";
import {useI18nStore} from "@/vol_apps/i8n/i18n_store";
import {ChevronRight} from "lucide-react";
import {useEffect, useRef, useState} from "react";

// 辅助函数：重置所有背景相关内联样式
function resetBackgroundStyles(html: HTMLElement, body: HTMLElement) {
	html.style.minHeight = "";
	body.style.minHeight = "";
	body.style.margin = "";
	body.style.padding = "";
	body.style.background = "";
	html.style.backgroundImage = "none";
	html.style.backgroundSize = "";
	html.style.backgroundRepeat = "";
	html.style.backgroundPosition = "";
	html.style.backgroundAttachment = "";
}

// 设置背景样式（不包含图片URL，图片URL单独设置）
function applyBackgroundStyles(
	html: HTMLElement,
	body: HTMLElement,
	bgSize: string,
	bgRepeat: boolean,
	bgCenter: boolean
) {
	html.style.backgroundSize = bgSize;
	html.style.backgroundRepeat = bgRepeat ? "repeat" : "no-repeat";
	html.style.backgroundPosition = bgCenter ? "center" : "top left";
	html.style.minHeight = "100vh";
	body.style.minHeight = "100vh";
	body.style.margin = "0";
	body.style.padding = "0";
	body.style.background = "transparent";
}

export function BgApp() {
	const {
		bgImg,
		bgType,
		bgSize,
		bgRepeat,
		bgCenter,
		otherVisible,
	} = useBgStore();

	const {language} = useI18nStore();
	const [copyright, setCopyright] = useState("");
	const [index, setIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	const mkt = {
		"cn": "zh-CN",
		"en": "en-US",
	}[language];

	// 用于取消旧预加载的计数器
	const loadingIdRef = useRef(0);
	// 存储当前显示的图片URL，避免重复设置相同URL
	const currentImageUrlRef = useRef<string | null>(null);

	// 获取版权信息（独立于背景设置，不阻塞背景更新）
	useEffect(() => {
		if (bgType !== "bing") {
			setCopyright("");
			return;
		}
		let cancelled = false;
		fetch(`https://bing.biturl.top/?&index=${index}&mkt=${mkt}`)
			.then((res) => res.json())
			.then((data) => {
				if (!cancelled) setCopyright(data.copyright);
			})
			.catch((err) => console.warn("Failed to fetch copyright", err));
		return () => {
			cancelled = true;
		};
	}, [index, bgType, language]);

	// 背景图片预加载与设置
	useEffect(() => {
		const html = document.documentElement;
		const body = document.body;
		let isActive = true;
		const currentLoadingId = ++loadingIdRef.current;

		// 根据当前状态生成图片URL
		let imageUrl: string | null = null;
		if (bgType === "bing") {
			imageUrl = `https://bing.biturl.top/?resolution=1920&format=image&index=${index}&mkt=${mkt}`;
		} else if (bgType === "default") {
			imageUrl = img; // 使用导入的 base64 图片
		} else if (bgType === "custom" && bgImg) {
			imageUrl = bgImg;
		}

		// 如果无需设置背景，重置样式
		if (!imageUrl) {
			if (isActive) {
				resetBackgroundStyles(html, body);
				currentImageUrlRef.current = null;
			}
			return;
		}

		// 如果URL与当前显示的相同，只需更新样式
		if (imageUrl === currentImageUrlRef.current) {
			applyBackgroundStyles(html, body, bgSize, bgRepeat, bgCenter);
			return;
		}

		// 开始预加载 - 使用不同的变量名避免冲突
		setIsLoading(true);
		const imageLoader = new Image();
		imageLoader.onload = () => {
			if (loadingIdRef.current === currentLoadingId && isActive) {
				// 再次校验最终URL是否仍然匹配
				let finalUrl: string | null = null;
				if (bgType === "bing") finalUrl = `https://bing.biturl.top/?resolution=1920&format=image&index=${index}&mkt=${mkt}`;
				else if (bgType === "default") finalUrl = img;   // 这里使用的是导入的 img
				else if (bgType === "custom" && bgImg) finalUrl = bgImg;

				if (finalUrl === imageUrl) {
					html.style.backgroundImage = `url("${imageUrl}")`;
					applyBackgroundStyles(html, body, bgSize, bgRepeat, bgCenter);
					currentImageUrlRef.current = imageUrl;
				}

				setIsLoading(false);
			}
		};
		imageLoader.onerror = () => {
			console.warn("Failed to load background image:", imageUrl);
			if (loadingIdRef.current === currentLoadingId && isActive) {
				resetBackgroundStyles(html, body);
				currentImageUrlRef.current = null;
				setIsLoading(false);
			}
		};
		imageLoader.src = imageUrl;

		return () => {
			isActive = false;
		};
	}, [bgType, bgImg, bgSize, bgRepeat, bgCenter, index, language]);

	// 只看背景模式
	useEffect(() => {
		if (otherVisible) {
			document.body.classList.remove("hide-others");
		} else {
			document.body.classList.add("hide-others");
		}
		return () => document.body.classList.remove("hide-others");
	}, [otherVisible]);

	return (
		<>
			<BgUi/>
			{bgType === "bing" && copyright && (
				<div className="absolute bottom-2 right-2">
					<div className="flex flex-row justify-center items-center w-fit gap-0 select-none">
						<p className="text-foreground text-sm">{copyright}</p>
						<Button variant="link" size={"icon"}
								className={"text-foreground"}
								onClick={() => setIndex((index + 1) % 8)}
								disabled={isLoading}
						>
							{isLoading
								? <Spinner className={"text-[#0078d7]"}/>
								: <ChevronRight className={"text-foreground"}/>}
						</Button>
					</div>
				</div>
			)}
		</>
	);
}