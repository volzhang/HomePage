import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Slider} from "@/components/ui/slider";
import {cn} from "@/lib/utils";
import {useCmStore} from "@/vol_apps/cm/cm_store";
import {CmUiFontFamily} from "@/vol_apps/cm/cm_ui_font_family";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 128;

const MIN_FONT_WEIGHT = 100;
const MAX_FONT_WEIGHT = 900;

export const CmUiFont = () => {
	const {t} = useTranslation("codemirror")

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
					<Button variant="outline">{fontPx}</Button>
				</PopoverTrigger>
				<PopoverContent className="w-100">
					<div className="grid gap-4">
						<div className="grid gap-3">
							{/* 字体 */}
							<div className="flex flex-row items-center gap-[12px]">
								<Label className={"w-10"}>{t("Font")}</Label>
								<CmUiFontFamily className={cn("w-fit text-sm border-none",
									// "text-[#0078d7]"
								)}/>
							</div>
							{/* 字号 */}
							<div className="flex flex-row items-center gap-[16px] ">
								<Label className={"w-10"} autoFocus={true}>{t("Size")}</Label>
								<Input
									// defaultValue="32"
									className={cn("w-14 h-8  text-[16px]! border-none",
										// "text-[#0078d7]"
									)}
									value={inputFontSize}
									onChange={(e) => setInputFontSize(e.target.value)}
									onBlur={handleBlurForFontSize}
									onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
								/>
								<Slider
									// defaultValue={[fontPx]}
									value={[fontPx]}
									onValueChange={(value) => setFontPx(value[0])}
									max={MAX_FONT_SIZE}
									min={MIN_FONT_SIZE}
									step={2}
									className={"w-52"}
								/>
							</div>
							{/* 粗细 */}
							<div className="flex flex-row items-center gap-[16px]">
								<Label className={"w-10"}>{t("Weight")}</Label>
								<Input
									// defaultValue="400"
									className={cn("w-14 h-8 text-[16px]! border-none",
										// "text-[#0078d7]"
										)}
									value={inputFontWeight}
									onChange={(e) => setInputFontWeight(e.target.value)}
									onBlur={handleFocusForFontWeight}
									onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
								/>
								<Slider
									// defaultValue={[fontWeight]}
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