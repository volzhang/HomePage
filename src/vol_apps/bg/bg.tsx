import { useBgStore } from "@/vol_apps/bg/bg_store";
import { BgUi } from "@/vol_apps/bg/bg_ui";
import { useEffect } from "react";

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

export function BgApp() {
	const { bgImg, bgSize, bgRepeat, bgCenter, otherVisible } = useBgStore();

	// 背景样式同步（含全屏覆盖）
	useEffect(() => {
		const html = document.documentElement;
		const body = document.body;

		if (bgImg && typeof bgImg === "string" && bgImg.startsWith("data:image/")) {
			// 强制布局占满视口
			html.style.minHeight = "100vh";
			body.style.minHeight = "100vh";
			body.style.margin = "0";
			body.style.padding = "0";

			// body 透明，让 html 背景透出
			body.style.background = "transparent";

			// 应用背景样式
			html.style.backgroundImage = `url("${bgImg}")`;
			html.style.backgroundSize = bgSize || "auto";
			html.style.backgroundRepeat = bgRepeat ? "repeat" : "no-repeat";
			html.style.backgroundPosition = bgCenter ? "center" : "top left";
			// html.style.backgroundAttachment = "fixed";
		} else {
			// 无背景图：恢复默认
			resetBackgroundStyles(html, body);
		}

		// 清理函数（组件卸载时）
		return () => resetBackgroundStyles(html, body);
	}, [bgImg, bgSize, bgRepeat, bgCenter]);

	// 只看背景模式
	useEffect(() => {
		if (otherVisible) {
			document.body.classList.remove("hide-others");
		} else {
			document.body.classList.add("hide-others");
		}
		return () => document.body.classList.remove("hide-others");
	}, [otherVisible]);

	return <BgUi />;
}