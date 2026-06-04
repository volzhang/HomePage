import {MyRadio} from "@/vol_apps/bg/bg_ui_settings";
// import {resetTagStyles, useTagStyleHasChanges, useTagStyleStore} from "@/vol_apps/tag/tag_style_store";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {memo, useEffect, useState} from "react";
import {NumberField, NumberFieldXY} from "@/vol_apps/tile/NumberField";
import {FontFamily} from "@/vol_apps/tile/FontFamilyField";
import {ColorPickerField} from "@/vol_apps/tile/ColorPickerField";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {useLanguageAtom} from "@/vol_apps/language/languageAtom.ts";
import {tagStyleAtom} from "@/vol_apps/tag/TagStyleAtom.ts";

// ==================== 可见性 ====================
const VisibilityRadio = memo(() => {
    const { t } = useLanguageAtom("tagBar");
    const { visible, setVisible } = tagStyleAtom.useField("visible");
    const options = [
        { value: "true", label: t("Visible") },
        { value: "false", label: t("Invisible") },
    ];
    return (
        <MyRadio
            title={t("Visible")}
            options={options}
            value={visible ? "true" : "false"}
            onValueChange={(v) => setVisible(v === "true")}
        />
    );
});

// ==================== 瓷砖匹配 ====================
const TileMatchingRadio = memo(() => {
    const { t } = useLanguageAtom("tagBar");
    const { isBroadMatches, setIsBroadMatches } = useTileStore();
    const options = [
        { value: "any", label: t("Matches Any Active Tag") },
        { value: "all", label: t("Matches All Active Tags") },
    ];
    return (
        <MyRadio
            title={t("Tile Matching")}
            options={options}
            value={isBroadMatches ? "any" : "all"}
            onValueChange={(v) => setIsBroadMatches(v === "any")}
        />
    );
});

// ==================== 样式模式（default/custom） ====================
const StyleModeRadio = memo(() => {
    const { t } = useLanguageAtom("tagBar");
    const atomChanged = tagStyleAtom.atomChanged();
    const [mode, setMode] = useState<"default" | "custom">(atomChanged ? "custom" : "default");

    useEffect(() => {
        setMode(atomChanged ? "custom" : "default");
    }, [atomChanged]);

    const options = [
        { value: "default", label: t("Default") },
        { value: "custom", label: t("Custom") },
    ];

    return (
        <MyRadio
            title={t("Styles")}
            options={options}
            value={mode}
            onValueChange={(value) => {
                if (value === "default") tagStyleAtom.reset();
                setMode(value as "default" | "custom");
            }}
        />
    );
});

// ==================== 间距与圆角 ====================
const SpacingRadiusSection = memo(() => {
    const { t } = useLanguageAtom("tagBar");
    const { radius, setRadius } = tagStyleAtom.useField("radius");
    const { gap, setGap } = tagStyleAtom.useField("gap");
    const { textPadding, setTextPadding } = tagStyleAtom.useField("textPadding");

    return (
        <AccordionItem value="Spacing&Radius">
            <AccordionTrigger>
                <p className="text-[16px]">{t("Spacing & Radius")}</p>
            </AccordionTrigger>
            <AccordionContent>
                <div className="flex flex-col gap-2">
                    <NumberFieldXY
                        label={t("Tag Gap")}
                        x={gap.x} y={gap.y}
                        onChangeX={(x) => setGap({ ...gap, x })}
                        onChangeY={(y) => setGap({ ...gap, y })}
                        min={0} max={50} step={1}
                    />
                    <NumberFieldXY
                        label={t("Tag Padding")}
                        x={textPadding.x} y={textPadding.y}
                        onChangeX={(x) => setTextPadding({ ...textPadding, x })}
                        onChangeY={(y) => setTextPadding({ ...textPadding, y })}
                        min={0} max={50} step={1}
                    />
                    <NumberField
                        label={t("Tag Radius")}
                        value={radius}
                        onChange={setRadius}
                        min={0} max={50} step={1}
                    />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
});


// ==================== 背景 ====================
const BackgroundSection = memo(() => {
    const { t } = useLanguageAtom("tagBar");
    const { backgroundColor, setBackgroundColor } = tagStyleAtom.useField("backgroundColor");
    const { backgroundOpacity, setBackgroundOpacity } = tagStyleAtom.useField("backgroundOpacity");

    return (
        <AccordionItem value="TagBackground">
            <AccordionTrigger>
                <p className="text-[16px]">{t("Background")}</p>
            </AccordionTrigger>
            <AccordionContent>
                <div className="flex flex-col gap-2">
                    <ColorPickerField
                        label={t("Background Color")}
                        value={backgroundColor === "auto" ? "#000000" : backgroundColor}
                        onChange={setBackgroundColor}
                    />
                    <NumberField
                        label={t("Background Opacity")}
                        value={backgroundOpacity}
                        onChange={setBackgroundOpacity}
                        min={0} max={1} step={0.01}
                    />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
});

// ==================== 文本与字体 ====================
const TextFontSection = memo(() => {
    const { t } = useLanguageAtom("tagBar");
    const { font, setFont } = tagStyleAtom.useField("font");
    const { fontSize, setFontSize } = tagStyleAtom.useField("fontSize");
    const { fontWeight, setFontWeight } = tagStyleAtom.useField("fontWeight");
    const { textColor, setTextColor } = tagStyleAtom.useField("textColor");
    const { textOpacity, setTextOpacity } = tagStyleAtom.useField("textOpacity");

    return (
        <AccordionItem value="TagText&Font">
            <AccordionTrigger>
                <p className="text-[16px]">{t("Text & Font")}</p>
            </AccordionTrigger>
            <AccordionContent>
                <div className="flex flex-col gap-2">
                    <FontFamily value={font} onChange={setFont} PopoverContentSide="bottom" />
                    <NumberField label={t("Font Size")} value={fontSize} onChange={setFontSize} min={0} max={40} step={0.5} />
                    <NumberField label={t("Font Weight")} value={fontWeight} onChange={setFontWeight} min={100} max={900} step={50} />
                    <ColorPickerField
                        label={t("Text Color")}
                        value={textColor === "auto" ? "#000000" : textColor}
                        onChange={setTextColor}
                    />
                    <NumberField label={t("Text Opacity")} value={textOpacity} onChange={setTextOpacity} min={0} max={1} step={0.01} />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
});


// ==================== 主组件（只做布局，不订阅具体状态） ====================
export const Setting_tag = () => {
    const [accordionValue, setAccordionValue] = useState<string[]>([]);

    return (
        <div className="flex flex-col gap-2.5 p-1 w-full">
            <VisibilityRadio />
            <TileMatchingRadio />
            <StyleModeRadio />

            <Accordion type="multiple" className="w-full p-2" value={accordionValue} onValueChange={setAccordionValue}>
                <SpacingRadiusSection />
                <BackgroundSection />
                <TextFontSection />
            </Accordion>
        </div>
    );
};


// export const Setting_tag = () => {
//
//
//     const {t} = useLanguageAtom("tagBar")
//
//     const tagVisibleOptions = [
//         {value: "true", label: t("Visible")},
//         {value: "false", label: t("Invisible")}
//     ]
//
//     const tagMatchOptions = [
//         {value: "any", label: t("Matches Any Active Tag")},
//         {value: "all", label: t("Matches All Active Tags")}
//     ]
//
//     const tagConfigOptions = [
//         {value: "default", label: t("Default")},
//         {value: "custom", label: t("Custom")}
//     ]
//
//     const [value, setValue] = useState<string[]>([]);
//
//     // const {visible, setVisible} = useTagStyleAtom()
//     // const {
//     //     radius, setRadius,
//     //     gap, setGap,
//     //     font, setFont,
//     //     fontSize, setFontSize,
//     //     fontWeight, setFontWeight,
//     //     textColor, setTextColor,
//     //     textOpacity, setTextOpacity,
//     //     textPadding, setTextPadding,
//     //
//     //     backgroundColor, setBackgroundColor,
//     //     backgroundOpacity, setBackgroundOpacity,
//     //
//     //     hasChanges:stylesHasChanged,
//     //     reset:resetTagStyles,
//     // } = useTagStyleAtom()
//
//     // const stylesHasChanged = useTagStyleHasChanges()
//     const {isBroadMatches, setIsBroadMatches} = useTileStore()
//
//     const [mode, setMode] = useState<"default" | "custom">(
//         stylesHasChanged ? "custom" : "default"
//     );
//
//     useEffect(() => {
//         setMode(stylesHasChanged ? "custom" : "default");
//     }, [stylesHasChanged]);
//
//     return (
//         <div className={"flex flex-col gap-2.5 p-1 w-full"}>
//             <MyRadio title={t("Visible")} options={tagVisibleOptions}
//                      value={visible ? "true" : "false"}
//                      onValueChange={(value) => setVisible(value === "true")}
//             />
//
//             <MyRadio title={t("Tile Matching")} options={tagMatchOptions}
//                      value={isBroadMatches ? "any" : "all"}
//                      onValueChange={(value) => setIsBroadMatches(value === "any")}
//             />
//
//             <MyRadio title={t("Styles")} options={tagConfigOptions} value={mode}
//                      onValueChange={(value) => {
//                          if (value === "default") resetTagStyles()
//                          setMode(value as "default" | "custom");
//                      }}
//             />
//
//             <Accordion type="multiple" className="w-full p-2" value={value} onValueChange={(v) => setValue(v)}>
//
//                 <AccordionItem value="Spacing&Radius">
//                     <AccordionTrigger>
//                         <p className={cn("text-[16px]")}>{t("Spacing & Radius")}</p>
//                     </AccordionTrigger>
//                     <AccordionContent>
//                         <div className={"flex flex-col gap-2"}>
//                             <NumberFieldXY x={gap.x} y={gap.y} label={t("Tag Gap")}
//                                            onChangeX={(x) => {
//                                                setGap({x, y: gap.y})
//                                            }}
//                                            min={0} max={50} step={1}
//                                            onChangeY={(y) => {
//                                                setGap({x: gap.x, y})
//                                            }}/>
//                             <NumberFieldXY label={t("Tag Padding")} x={textPadding.x} y={textPadding.y}
//                                            onChangeX={(x) => setTextPadding({x, y: textPadding.y})}
//                                            onChangeY={(y) => setTextPadding({x: textPadding.x, y})}
//                                            min={0} max={50} step={1}/>
//                             <NumberField label={t("Tag Radius")} value={radius}
//                                          onChange={(v) => setRadius(v)} min={0} max={50} step={1}/>
//                         </div>
//                     </AccordionContent>
//                 </AccordionItem>
//                 <AccordionItem value="TagBackground">
//                     <AccordionTrigger>
//                         <p className={cn("text-[16px]")}>{t("Background")}</p>
//                     </AccordionTrigger>
//                     <AccordionContent>
//                         <div className={"flex flex-col gap-2"}>
//                             <ColorPickerField label={t("Background Color")} value={backgroundColor === "auto" ? "#000000" : backgroundColor}
//                                               onChange={(v) => setBackgroundColor(v)}/>
//                             <NumberField label={t("Background Opacity")} value={backgroundOpacity}
//                                          onChange={(v) => setBackgroundOpacity(v)} min={0} max={1} step={0.01}/>
//                         </div>
//                     </AccordionContent>
//                 </AccordionItem>
//                 <AccordionItem value="TagText&Font">
//                     <AccordionTrigger>
//                         <p className={cn("text-[16px]")}>{t("Text & Font")}</p>
//                     </AccordionTrigger>
//                     <AccordionContent>
//                         <div className={"flex flex-col gap-2"}>
//                             <FontFamily value={font} onChange={(v) => setFont(v)} PopoverContentSide={"bottom"}/>
//                             <NumberField label={t("Font Size")} value={fontSize} onChange={(v) => setFontSize(v)}
//                                          min={0} max={40} step={0.5}/>
//                             <NumberField label={t("Font Weight")} value={fontWeight} onChange={(v) => setFontWeight(v)}
//                                          min={100} max={900} step={50}/>
//                             <ColorPickerField label={t("Text Color")} value={textColor === "auto"? "#000000" : textColor}
//                                               onChange={(v) => setTextColor(v)}/>
//                             <NumberField label={t("Text Opacity")} value={textOpacity}
//                                          onChange={(v) => setTextOpacity(v)} min={0} max={1} step={0.01}/>
//                         </div>
//                     </AccordionContent>
//                 </AccordionItem>
//
//             </Accordion>
//         </div>
//     )
// }