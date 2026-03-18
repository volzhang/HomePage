import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Slider} from "@/components/ui/slider";
import {cn} from "@/lib/utils";
import {useCmStore} from "@/vol_apps/cm/cm_store";
import {CmUiFontFamily} from "@/vol_apps/cm/cm_ui_font_family";
import {useEffect, useState} from "react";

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 128;

const MIN_FONT_WEIGHT = 100;
const MAX_FONT_WEIGHT = 900;

export const CmUiFont = () => {
	const {
		fontPx, setFontPx,
		fontWeight, setFontWeight,
	} = useCmStore();

	const [inputFontSize, setInputFontSize] = useState<string>(fontPx.toString());
	const [inputFontWeight, setInputFontWeight] = useState<string>(fontPx.toString());

	useEffect(() => {
		setInputFontSize(fontPx.toString());
		setInputFontWeight(fontWeight.toString());
	}, [fontPx, fontWeight]);

	const handleBlurForFontSize = () => {
		let newSize = parseFloat(inputFontSize);
		if (isNaN(newSize)) {
			newSize = fontPx; // 无效输入则回退到当前有效值
		} else {
			newSize = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, newSize));
		}
		setFontPx(newSize);
		setInputFontSize(newSize.toString());
	};

	const handleFocusForFontWeight = () => {
		let newWeight = parseFloat(inputFontWeight);
		if (isNaN(newWeight)) {
			newWeight = fontWeight;
		} else {
			newWeight = Math.min(MAX_FONT_WEIGHT, Math.max(MIN_FONT_WEIGHT, newWeight));
		}
		setFontWeight(newWeight);
		setInputFontWeight(newWeight.toString());
	};

	return (
		<>
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline">Font</Button>
				</PopoverTrigger>
				<PopoverContent className="w-96">
					<div className="grid gap-4">
						{/*<div className="space-y-2">*/}
							{/*<h4 className="leading-none font-medium">Dimensions</h4>*/}
							{/*<p className="text-sm text-muted-foreground">*/}
							{/*	设置字体，字号，粗细。*/}
							{/*</p>*/}
						{/*</div>*/}
						<div className="grid gap-3">
							<div className="flex flex-row items-center gap-[7px]">
								<Label className={"w-8"}>字体</Label>
								<CmUiFontFamily className={cn("w-fit text-[18px]",
									// "text-[#0078d7]"
								)}/>
							</div>
							{/* 字号 */}
							<div className="flex flex-row items-center gap-[11px] ">
								<Label className={"w-8"}>字号</Label>
								<Input
									defaultValue="32"
									className={cn("w-14 h-8  text-[16px]! border-none",
										// "text-[#0078d7]"
									)}
									value={inputFontSize}
									onChange={(e) => setInputFontSize(e.target.value)}
									onBlur={handleBlurForFontSize}
									onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
								/>
								<Slider
									defaultValue={[fontPx]}
									value={[fontPx]}
									onValueChange={(value) => setFontPx(value[0])}
									max={MAX_FONT_SIZE}
									min={MIN_FONT_SIZE}
									step={2}
									className={"w-52"}
								/>
							</div>
							{/* 粗细 */}
							<div className="flex flex-row items-center gap-[11px]">
								<Label className={"w-8"}>粗细</Label>
								<Input
									defaultValue="400"
									className={cn("w-14 h-8 text-[16px]! border-none",
										// "text-[#0078d7]"
										)}
									value={inputFontWeight}
									onChange={(e) => setInputFontWeight(e.target.value)}
									onBlur={handleFocusForFontWeight}
									onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
								/>
								<Slider
									defaultValue={[fontWeight]}
									value={[fontWeight]}
									onValueChange={(value) => setFontWeight(value[0])}
									max={MAX_FONT_WEIGHT}
									min={MIN_FONT_WEIGHT}
									step={100}
									className={"w-52"}
								/>
							</div>

						</div>
					</div>
				</PopoverContent>
			</Popover>
		</>
	);
};