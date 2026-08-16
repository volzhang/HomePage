import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Slider} from "@/components/ui/slider";
import {cn} from "@/lib/utils";

import {useEffect, useState} from "react";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {cmStore} from "@/vol_apps/cm/cm_atom.ts";
import {usePopover} from "@/vol_apps/02_hooks/float/myPopover.tsx";

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 128;

const MIN_FONT_WEIGHT = 100;
const MAX_FONT_WEIGHT = 900;

const MIN_LINE_HEIGHT = 8;
const MAX_LINE_HEIGHT = 256;

export const CmUiFont = () => {
    const {t} = useLanguage()

    const {fontPx, setFontPx} = useSignal(cmStore("fontPx"));
    const {fontWeight, setFontWeight} = useSignal(cmStore("fontWeight"));
    const {fontLineHeight, setFontLineHeight} = useSignal(cmStore("fontLineHeight"));

    const [inputFontSize, setInputFontSize] = useState<string>(fontPx.toString());
    const [inputFontWeight, setInputFontWeight] = useState<string>(fontWeight.toString());
    const [inputFontLineHeight, setInputFontLineHeight] = useState<string>(fontLineHeight.toString());

    useEffect(() => {
        setInputFontSize(fontPx.toString());
        setInputFontWeight(fontWeight.toString());
        setInputFontLineHeight(fontLineHeight.toString())
    }, [fontPx, fontWeight, fontLineHeight]);

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

    const handleFocusForFontLineHeight = () => {
        let newHeight = parseFloat(inputFontLineHeight);
        if (isNaN(newHeight)) {
            newHeight = fontLineHeight;
        } else {
            newHeight = Math.min(MAX_LINE_HEIGHT, Math.max(MIN_LINE_HEIGHT, newHeight));
        }
        setFontLineHeight(newHeight);
        setInputFontLineHeight(newHeight.toString());
    };

    const [open, setOpen] = useState(false);

    const {
        anchorRef, floatingRef, floatingPortal, floatingStyle
    } = usePopover({
        open,
        onOpenChange: setOpen,
        direction: "bottom",
        align: "center",
        duration: 200,
        exitDuration: 200,
        offset: 4,
        zIndex: 30,
		scale: 95,
    })

    return (
        <>
			<Button ref={anchorRef} variant="outline" onClick={()=>setOpen(!open)}>{fontPx}</Button>
			{floatingPortal(
				<div ref={floatingRef} style={floatingStyle}>
					<div className={"w-100 h-fit border bg-popover p-4 rounded-md text-popover-foreground shadow-md outline-hidden"}>
						<div className="grid gap-4">
							<div className="grid gap-3">
								{/*/!* 字体 *!/*/}
								{/*<div className="flex flex-row items-center gap-[12px]">*/}
								{/*	<label className={"w-10 text-sm"}>{t("Font")}</label>*/}
								{/*	<CmUiFontFamily className={cn("w-fit text-sm border-none",*/}
								{/*		// "text-[#0078d7]"*/}
								{/*	)}/>*/}
								{/*</div>*/}
								{/* 字号 */}
								<div className="flex flex-row items-center gap-[16px] ">
									<label className={"w-10 text-sm"} autoFocus={true}>{t("Size")}</label>
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
									<label className={"w-10 text-sm"}>{t("Weight")}</label>
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
								{/* 行高 */}
								<div className="flex flex-row items-center gap-[16px]">
									<label className={"w-10 text-sm"}>{t("Line Height")}</label>
									<Input
										className={cn("w-14 h-8 text-[16px]! border-none",
										)}
										value={inputFontLineHeight}
										onChange={(e) => setInputFontLineHeight(e.target.value)}
										onBlur={handleFocusForFontLineHeight}
										onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
									/>
									<Slider
										value={[fontLineHeight]}
										onValueChange={(value) => setFontLineHeight(value[0])}
										max={MAX_LINE_HEIGHT}
										min={MIN_LINE_HEIGHT}
										step={1}
										className={"w-52"}
									/>
								</div>
								{/*/!* 测试 *!/*/}
								{/*<div>*/}
								{/*	<input type={"range"} className={"bg-sBlue"} min={0} max={100} defaultValue={"50"}></input>*/}
								{/*</div>*/}
							</div>
						</div>
					</div>
				</div>
			)}
        </>
    );
};