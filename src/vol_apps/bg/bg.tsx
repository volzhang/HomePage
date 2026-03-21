import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {useBgStore} from "@/vol_apps/bg/bg_store";
import {BgUi} from "@/vol_apps/bg/bg_ui";
import {useBing} from "@/vol_apps/bg/bg_useBing";
import {ChevronRight} from "lucide-react";
import {useEffect} from "react";

export const setBackground = (
	base64: string,
	bgSize: string,
	bgRepeat: boolean,
	bgCenter: boolean
) => {

	const html = document.documentElement;
	const body = document.body;

	html.style.backgroundImage = `url("${base64}")`;
	html.style.backgroundSize = bgSize;
	html.style.backgroundRepeat = bgRepeat ? "repeat" : "no-repeat";
	html.style.backgroundPosition = bgCenter ? "center" : "top left";
	html.style.minHeight = "100vh";
	body.style.minHeight = "100vh";
	body.style.margin = "0";
	body.style.padding = "0";
	body.style.background = "transparent";
};


export function BgApp() {
	const {bgImg, bgType, bgSize, bgRepeat, bgCenter, otherVisible, bgBingCopyright} = useBgStore();
	const {isLoading, handleNextBing} = useBing();

	// 更新背景样式
	useEffect(() => {
		setBackground(bgImg, bgSize, bgRepeat, bgCenter);
	}, [bgImg, bgSize, bgRepeat, bgCenter]);

	// ==================== ui mode ====================
	useEffect(() => {
		document.body.classList.toggle("hide-others", !otherVisible);
		return () => document.body.classList.remove("hide-others");
	}, [otherVisible]);

	return (
		<>
			<BgUi/>
			{bgType === "bing" ? (
				<div className="absolute bottom-2 right-2">
					<div className="flex flex-row justify-center items-center w-fit gap-0 select-none">
						<p className="text-foreground text-sm">{bgBingCopyright}</p>
						<Button
							variant="link"
							size="icon"
							className="text-foreground"
							onClick={handleNextBing}
							disabled={isLoading}
						>
							{isLoading ? (
								<Spinner className="text-[#0078d7]"/>
							) : (
								<ChevronRight className="text-foreground"/>
							)}
						</Button>
					</div>
				</div>
			) : null
			}
		</>
	);
}