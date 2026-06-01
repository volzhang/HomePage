import {MyRadio} from "@/vol_apps/bg/bg_ui_settings";
// import {resetTagStyles, useTagStyleHasChanges, useTagStyleStore} from "@/vol_apps/tag/tag_style_store";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {useEffect, useState} from "react";
import {NumberField, NumberFieldXY} from "@/vol_apps/tile/NumberField";
import {cn} from "@/lib/utils";
import {FontFamily} from "@/vol_apps/tile/FontFamilyField";
import {ColorPickerField} from "@/vol_apps/tile/ColorPickerField";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {useLanguageAtom} from "@/vol_apps/language/languageAtom.ts";
import {useTagStyleAtom} from "@/vol_apps/tag/TagStyleAtom.ts";

export const Setting_tag = () => {
    const {visible, setVisible} = useTagStyleAtom()
    const {t} = useLanguageAtom("tagBar")

    const tagVisibleOptions = [
        {value: "true", label: t("Visible")},
        {value: "false", label: t("Invisible")}
    ]

    const tagMatchOptions = [
        {value: "any", label: t("Matches Any Active Tag")},
        {value: "all", label: t("Matches All Active Tags")}
    ]

    const tagConfigOptions = [
        {value: "default", label: t("Default")},
        {value: "custom", label: t("Custom")}
    ]

    const [value, setValue] = useState<string[]>([]);
    const {
        radius, setRadius,
        gap, setGap,
        font, setFont,
        fontSize, setFontSize,
        fontWeight, setFontWeight,
        textColor, setTextColor,
        textOpacity, setTextOpacity,
        textPadding, setTextPadding,

        backgroundColor, setBackgroundColor,
        backgroundOpacity, setBackgroundOpacity,

        hasChanges:stylesHasChanged,
        reset:resetTagStyles,
    } = useTagStyleAtom()

    // const stylesHasChanged = useTagStyleHasChanges()
    const {isBroadMatches, setIsBroadMatches} = useTileStore()

    const [mode, setMode] = useState<"default" | "custom">(
        stylesHasChanged ? "custom" : "default"
    );

    useEffect(() => {
        setMode(stylesHasChanged ? "custom" : "default");
    }, [stylesHasChanged]);

    return (
        <div className={"flex flex-col gap-2.5 p-1 w-full"}>
            <MyRadio title={t("Visible")} options={tagVisibleOptions}
                     value={visible ? "true" : "false"}
                     onValueChange={(value) => setVisible(value === "true")}
            />

            <MyRadio title={t("Tile Matching")} options={tagMatchOptions}
                     value={isBroadMatches ? "any" : "all"}
                     onValueChange={(value) => setIsBroadMatches(value === "any")}
            />

            <MyRadio title={t("Styles")} options={tagConfigOptions} value={mode}
                     onValueChange={(value) => {
                         if (value === "default") resetTagStyles()
                         setMode(value as "default" | "custom");
                     }}
            />

            <Accordion type="multiple" className="w-full p-2" value={value} onValueChange={(v) => setValue(v)}>

                <AccordionItem value="Spacing&Radius">
                    <AccordionTrigger>
                        <p className={cn("text-[16px]")}>{t("Spacing & Radius")}</p>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className={"flex flex-col gap-2"}>
                            <NumberFieldXY x={gap.x} y={gap.y} label={t("Tag Gap")}
                                           onChangeX={(x) => {
                                               setGap({x, y: gap.y})
                                           }}
                                           min={0} max={50} step={1}
                                           onChangeY={(y) => {
                                               setGap({x: gap.x, y})
                                           }}/>
                            <NumberFieldXY label={t("Tag Padding")} x={textPadding.x} y={textPadding.y}
                                           onChangeX={(x) => setTextPadding({x, y: textPadding.y})}
                                           onChangeY={(y) => setTextPadding({x: textPadding.x, y})}
                                           min={0} max={50} step={1}/>
                            <NumberField label={t("Tag Radius")} value={radius}
                                         onChange={(v) => setRadius(v)} min={0} max={50} step={1}/>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="TagBackground">
                    <AccordionTrigger>
                        <p className={cn("text-[16px]")}>{t("Background")}</p>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className={"flex flex-col gap-2"}>
                            <ColorPickerField label={t("Background Color")} value={backgroundColor === "auto" ? "#000000" : backgroundColor}
                                              onChange={(v) => setBackgroundColor(v)}/>
                            <NumberField label={t("Background Opacity")} value={backgroundOpacity}
                                         onChange={(v) => setBackgroundOpacity(v)} min={0} max={1} step={0.01}/>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="TagText&Font">
                    <AccordionTrigger>
                        <p className={cn("text-[16px]")}>{t("Text & Font")}</p>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className={"flex flex-col gap-2"}>
                            <FontFamily value={font} onChange={(v) => setFont(v)} PopoverContentSide={"bottom"}/>
                            <NumberField label={t("Font Size")} value={fontSize} onChange={(v) => setFontSize(v)}
                                         min={0} max={40} step={0.5}/>
                            <NumberField label={t("Font Weight")} value={fontWeight} onChange={(v) => setFontWeight(v)}
                                         min={100} max={900} step={50}/>
                            <ColorPickerField label={t("Text Color")} value={textColor === "auto"? "#000000" : textColor}
                                              onChange={(v) => setTextColor(v)}/>
                            <NumberField label={t("Text Opacity")} value={textOpacity}
                                         onChange={(v) => setTextOpacity(v)} min={0} max={1} step={0.01}/>
                        </div>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
        </div>
    )
}