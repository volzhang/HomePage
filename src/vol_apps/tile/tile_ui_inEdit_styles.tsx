import { memo, useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { NumberField, NumberFieldXY } from "@/vol_apps/tile/NumberField";
import { FontFamily } from "@/vol_apps/tile/FontFamilyField";
import { ColorPickerField } from "@/vol_apps/tile/ColorPickerField";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {tileStyleConfig} from "@/vol_apps/tile/tile_style_atom.ts";

// ==================== 背景设置 ====================
const BackgroundSection = memo(() => {
    const { t } = useLanguage();

    const { backgroundColor, setBackgroundColor } = useSignal(...tileStyleConfig("backgroundColor"))
    const { backgroundOpacity, setBackgroundOpacity } = useSignal(...tileStyleConfig("backgroundOpacity"))

    return (
        <AccordionItem value="TileBackground">
            <AccordionTrigger>
                <p className="font-bold text-lg">{t("Background")}</p>
            </AccordionTrigger>
            <AccordionContent>
                <div className="flex flex-col gap-2">
                    <ColorPickerField
                        label={t("Background Color")}
                        value={backgroundColor}
                        onChange={setBackgroundColor}
                    />
                    <NumberField
                        label={t("Background Opacity")}
                        value={backgroundOpacity}
                        onChange={setBackgroundOpacity}
                        min={0} max={1} step={0.01}
                        // fallback={tileStyleInit.backgroundOpacity}
                    />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
});

// ==================== 尺寸与圆角 ====================
const SizeRadiusSection = memo(() => {
    const { t } = useLanguage();
    const { tileSize, setTileSize } = useSignal(...tileStyleConfig("tileSize"))
    const { tileRadius, setTileRadius } = useSignal(...tileStyleConfig("tileRadius"))

    return (
        <AccordionItem value="TileSize&Radius">
            <AccordionTrigger>
                <p className="font-bold text-lg">{t("Size & Radius")}</p>
            </AccordionTrigger>
            <AccordionContent>
                <div className="flex flex-col gap-2">
                    <NumberField
                        label={t("Tile Size")}
                        value={tileSize}
                        onChange={setTileSize}
                        // fallback={tileStyleInit.tileSize}
                        min={0} max={200} step={2}
                    />
                    <NumberField
                        label={t("Tile Radius")}
                        value={tileRadius}
                        onChange={setTileRadius}
                        // fallback={tileStyleInit.tileRadius}
                        min={0} max={100} step={1}
                    />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
});

// ==================== 图标设置 ====================
const IconSection = memo(() => {
    const { t } = useLanguage();
    const { iconBorderSize, setIconBorderSize } = useSignal(...tileStyleConfig("iconBorderSize"))
    const { iconBorderOffset, setIconBorderOffset } = useSignal(...tileStyleConfig("iconBorderOffset"))
    const { iconSize, setIconSize } = useSignal(...tileStyleConfig("iconSize"))
    const { iconOffset, setIconOffset } = useSignal(...tileStyleConfig("iconOffset"))

    return (
        <AccordionItem value="TileIcon">
            <AccordionTrigger>
                <p className="font-bold text-lg">{t("Icon")}</p>
            </AccordionTrigger>
            <AccordionContent>
                <div className="flex flex-col gap-2">
                    <NumberField
                        label={t("Icon Border Size")}
                        value={iconBorderSize}
                        onChange={setIconBorderSize}
                        // fallback={tileStyleInit.iconBorderSize}
                        min={0} max={200} step={2}
                    />
                    <NumberFieldXY
                        label={t("Icon Border Offset")}
                        x={iconBorderOffset.x}
                        onChangeX={(x) => setIconBorderOffset({ ...iconBorderOffset, x })}
                        y={iconBorderOffset.y}
                        onChangeY={(y) => setIconBorderOffset({ ...iconBorderOffset, y })}
                        // fallback={tileStyleInit.iconBorderOffset}
                        min={-100} max={100} step={1}
                    />
                    <NumberField
                        label={t("Icon Size")}
                        value={iconSize}
                        onChange={setIconSize}
                        // fallback={tileStyleInit.iconSize}
                        min={0} max={200} step={2}
                    />
                    <NumberFieldXY
                        label={t("Icon Offset")}
                        x={iconOffset.x}
                        onChangeX={(x) => setIconOffset({ ...iconOffset, x })}
                        y={iconOffset.y}
                        onChangeY={(y) => setIconOffset({ ...iconOffset, y })}
                        // fallback={tileStyleInit.iconOffset}
                        min={-100} max={100} step={1}
                    />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
});

// ==================== 文本与字体 ====================
const TextFontSection = memo(() => {
    const { t } = useLanguage();
    const { font, setFont } = useSignal(...tileStyleConfig("font"))
    const { fontSize, setFontSize } = useSignal(...tileStyleConfig("fontSize"))
    const { fontWeight, setFontWeight } = useSignal(...tileStyleConfig("fontWeight"))
    const { textColor, setTextColor } = useSignal(...tileStyleConfig("textColor"))
    const { textOpacity, setTextOpacity } = useSignal(...tileStyleConfig("textOpacity"))
    const { textOffset, setTextOffset } = useSignal(...tileStyleConfig("textOffset"))

    return (
        <AccordionItem value="TileText&Font">
            <AccordionTrigger>
                <p className="font-bold text-lg">{t("Text & Font")}</p>
            </AccordionTrigger>
            <AccordionContent>
                <div className="flex flex-col gap-2">
                    <FontFamily value={font} onChange={setFont} />
                    <NumberField
                        label={t("Font Size")}
                        value={fontSize}
                        onChange={setFontSize}
                        // fallback={tileStyleInit.fontSize}
                        min={0} max={40} step={0.5}
                    />
                    <NumberField
                        label={t("Font Weight")}
                        value={fontWeight}
                        onChange={setFontWeight}
                        // fallback={tileStyleInit.fontWeight}
                        min={100} max={900} step={50}
                    />
                    <ColorPickerField
                        label={t("Text Color")}
                        value={textColor}
                        onChange={setTextColor}/>
                    <NumberField
                        label={t("Text Opacity")}
                        value={textOpacity}
                        onChange={setTextOpacity}
                        // fallback={tileStyleInit.textOpacity}
                        min={0} max={1} step={0.01}
                    />
                    <NumberFieldXY
                        label={t("Text Offset")}
                        x={textOffset.x}
                        onChangeX={(x) => setTextOffset({ ...textOffset, x })}
                        y={textOffset.y}
                        onChangeY={(y) => setTextOffset({ ...textOffset, y })}
                        // fallback={tileStyleInit.textOffset}
                        min={-100} max={100} step={1}
                    />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
});

// ==================== 轮廓设置 ====================
const OutlineSection = memo(() => {
    const { t } = useLanguage();
    const { tileOutlineThickness, setTileOutlineThickness } = useSignal(...tileStyleConfig("tileOutlineThickness"))
    const { tileOutlineColor, setTileOutlineColor } = useSignal(...tileStyleConfig("tileOutlineColor"))
    const { tileOutlineOpacity, setTileOutlineOpacity } = useSignal(...tileStyleConfig("tileOutlineOpacity"))

    return (
        <AccordionItem value="TileOutline">
            <AccordionTrigger>
                <p className="font-bold text-lg">{t("Outline")}</p>
            </AccordionTrigger>
            <AccordionContent>
                <div className="flex flex-col gap-2">
                    <NumberField
                        label={t("Outline Thickness")}
                        value={tileOutlineThickness}
                        onChange={setTileOutlineThickness}
                        min={0} max={10} step={1}
                    />
                    <ColorPickerField
                        label={t("Outline Color")}
                        value={tileOutlineColor}
                        onChange={setTileOutlineColor}
                    />
                    <NumberField
                        label={t("Outline Opacity")}
                        value={tileOutlineOpacity}
                        onChange={setTileOutlineOpacity}
                        min={0} max={1} step={0.01}
                    />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
});

// ==================== 主组件 ====================
interface TileUiInEditStylesProps {
    tileUiVisible: boolean;
}

export const Tile_ui_inEdit_styles = memo(({ tileUiVisible }: TileUiInEditStylesProps) => {
    const [value, setValue] = useState<string[]>([]);

    useEffect(() => {
        if (!tileUiVisible) setValue([]);
    }, [tileUiVisible]);

    return (
        <div className="overflow-hidden relative">
            <div className="ml-6 px-0">
                <Accordion type="multiple" className="w-full" value={value} onValueChange={setValue}>
                    <BackgroundSection />
                    <SizeRadiusSection />
                    <IconSection />
                    <TextFontSection />
                    <OutlineSection />
                </Accordion>
            </div>
        </div>
    );
});