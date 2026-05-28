import {cn} from "@/lib/utils";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {NumberField, NumberFieldXY} from "@/vol_apps/tile/NumberField";
import {FontFamily} from "@/vol_apps/tile/FontFamilyField";
import type {TileLogic} from "@/vol_apps/tile/useTileLogic";
import {ThrottledColorPicker} from "@/vol_apps/tile/ThrottledColorPickerProps";
import {useEffect, useState} from "react";
import {ColorPickerField} from "@/vol_apps/tile/ColorPickerField";

const tileSizeMin = 0;
const tileSizeMax = 200;

const tileRadiusMin = 0;
const tileRadiusMax = 100;

const iconBorderSizeMin = 0;
const iconBorderSizeMax = 200;

const iconBorderOffsetMin = -100;
const iconBorderOffsetMax = 100;

const iconSizeMin = 0;
const iconSizeMax = 200;

const iconOffsetMin = -100;
const iconOffsetMax = 100;

const textOffsetMin = -100;
const textOffsetMax = 100;

const fontSizeMin = 0;
const fontSizeMax = 40;

const fontWeightMin = 100;
const fontWeightMax = 900;

const textOpacityMin = 0;
const textOpacityMax = 1;

const backgroundOpacityMin = 0;
const backgroundOpacityMax = 1;

const tileOutlineThicknessMin = 0;
const tileOutlineThicknessMax = 10;

const tileOutlineOpacityMin = 0;
const tileOutlineOpacityMax = 1;

export const Tile_ui_inEdit_styles = (
    {
        t,
        backgroundColor, setBackgroundColor,
        backgroundOpacity, setBackgroundOpacity,

        tileSize, setTileSize,
        tileRadius, setTileRadius,

        tileOutlineThickness, setTileOutlineThickness,
        tileOutlineColor, setTileOutlineColor,
        tileOutlineOpacity, setTileOutlineOpacity,

        iconBorderSize, setIconBorderSize,
        iconBorderOffset, setIconBorderOffset,
        iconSize, setIconSize,
        iconOffset, setIconOffset,

        textColor, setTextColor,
        textOpacity, setTextOpacity,

        fontSize, setFontSize,
        fontWeight, setFontWeight,
        font, setFont,
        textOffset, setTextOffset,

        INITIAL_STYLE,

        tileUiVisible,

    }: TileLogic
)=>{
    const [value, setValue] = useState<string[]>([]);
    useEffect(() => {
        if (!tileUiVisible) setValue([]);
    }, [tileUiVisible]);

    return(
        <div className={cn("overflow-hidden relative")}>
            <div className={cn("ml-6 px-0")}>
                    <Accordion type="multiple" className="w-full" value={value} onValueChange={(v)=>setValue(v)}>
                    <AccordionItem value="TileBackground">
                        <AccordionTrigger>
                            <p className="font-bold text-lg">{t("Background")}</p>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-2">
                                <ColorPickerField label={t("Background Color")}
                                                  value={backgroundColor}
                                                  onChange={setBackgroundColor}
                                ></ColorPickerField>
                                <NumberField label={t("Background Opacity")}
                                             value={backgroundOpacity}
                                             onChange={setBackgroundOpacity}
                                             min={backgroundOpacityMin} max={backgroundOpacityMax}
                                             step={0.01}
                                             fallback={1}/>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="TileSize&Radius">
                        <AccordionTrigger>
                            <p className="font-bold text-lg">{t("Size & Radius")}</p>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-2">
                                <NumberField label={t("Tile Size")} value={tileSize} onChange={setTileSize}
                                             fallback={INITIAL_STYLE.tileSize}
                                             min={tileSizeMin} max={tileSizeMax} step={2}/>

                                <NumberField label={t("Tile Radius")} value={tileRadius} onChange={setTileRadius}
                                             fallback={INITIAL_STYLE.tileRadius}
                                             min={tileRadiusMin} max={tileRadiusMax} step={1}/>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="TileIcon">
                        <AccordionTrigger>
                            <p className="font-bold text-lg">{t("Icon")}</p>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-2">
                                <NumberField label={t("Icon Border Size")} value={iconBorderSize}
                                             onChange={setIconBorderSize} fallback={INITIAL_STYLE.iconBorderSize}
                                             min={iconBorderSizeMin} max={iconBorderSizeMax} step={2}/>

                                <NumberFieldXY label={t("Icon Border Offset")} x={iconBorderOffset.x}
                                               onChangeX={(x) => setIconBorderOffset({...iconBorderOffset, x})}
                                               y={iconBorderOffset.y}
                                               onChangeY={(y) => setIconBorderOffset({...iconBorderOffset, y})}
                                               fallback={INITIAL_STYLE.iconBorderOffset}
                                               min={iconBorderOffsetMin} max={iconBorderOffsetMax} step={1}
                                />

                                <NumberField label={t("Icon Size")} value={iconSize} onChange={setIconSize}
                                             fallback={INITIAL_STYLE.iconSize}
                                             min={iconSizeMin} max={iconSizeMax} step={2}/>

                                <NumberFieldXY label={t("Icon Offset")} x={iconOffset.x}
                                               onChangeX={(x) => setIconOffset({...iconOffset, x})}
                                               y={iconOffset.y}
                                               onChangeY={(y) => setIconOffset({...iconOffset, y})}
                                               fallback={INITIAL_STYLE.iconOffset}
                                               min={iconOffsetMin} max={iconOffsetMax} step={1}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="TileText&Font">
                        <AccordionTrigger>
                            <p className="font-bold text-lg">{t("Text & Font")}</p>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-2">
                                <FontFamily value={font} onChange={setFont}/>
                                <NumberField label={t("Font Size")}
                                             min={fontSizeMin} max={fontSizeMax} step={0.5}
                                             value={fontSize}
                                             onChange={setFontSize} fallback={INITIAL_STYLE.fontSize}/>
                                <NumberField label={t("Font Weight")}
                                             min={fontWeightMin} max={fontWeightMax} step={50}
                                             value={fontWeight}
                                             onChange={setFontWeight} fallback={INITIAL_STYLE.fontWeight}/>

                                <div className="grid grid-cols-2 w-full items-center">
                                    <p>{t("Text Color")}</p>
                                    <ThrottledColorPicker
                                        className={"border w-full items-center"}
                                        value={textColor} onChange={setTextColor} />
                                </div>
                                <NumberField label={t("Text Opacity")} value={textOpacity}
                                             onChange={setTextOpacity}
                                             min={textOpacityMin} max={textOpacityMax} step={0.01}
                                             fallback={1}/>

                                <NumberFieldXY label={t("Text Offset")}
                                               min={textOffsetMin} max={textOffsetMax} step={1}
                                               x={textOffset.x}
                                               onChangeX={(x) => setTextOffset({...textOffset, x})}
                                               y={textOffset.y}
                                               onChangeY={(y) => setTextOffset({...textOffset, y})}
                                               fallback={INITIAL_STYLE.textOffset}/>

                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="TileOutline">
                        <AccordionTrigger>
                            <p className="font-bold text-lg">{t("Outline")}</p>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-2">
                                <NumberField label={t("Outline Thickness")} value={tileOutlineThickness}
                                             onChange={setTileOutlineThickness} fallback={INITIAL_STYLE.tileOutlineThickness}
                                             min={tileOutlineThicknessMin} max={tileOutlineThicknessMax} step={1}/>
                                <div className="grid grid-cols-2 w-full items-center">
                                    <p>{t("Outline Color")}</p>
                                    <ThrottledColorPicker
                                        className={"border w-full items-center"}
                                        value={tileOutlineColor}
                                        onChange={setTileOutlineColor} />
                                </div>
                                <NumberField label={t("Outline Opacity")} value={tileOutlineOpacity}
                                             onChange={setTileOutlineOpacity}
                                             min={tileOutlineOpacityMin} max={tileOutlineOpacityMax} step={0.01}
                                             fallback={1}/>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}