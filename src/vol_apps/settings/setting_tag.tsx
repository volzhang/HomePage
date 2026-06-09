import {MyRadio} from "@/vol_apps/bg/bg_ui_settings";
// import {resetTagStyles, useTagStyleHasChanges, useTagStyleStore} from "@/vol_apps/tag/tag_style_store";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {memo, useEffect, useState} from "react";
import {NumberField, NumberFieldXY} from "@/vol_apps/tile/NumberField";
import {FontFamily} from "@/vol_apps/tile/FontFamilyField";
import {ColorPickerField} from "@/vol_apps/tile/ColorPickerField";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {storeHub, useSignal} from "@/vol_apps/04_persist_atoms";
import {tagStyleConfig} from "@/vol_apps/tag/TagStyleAtom.ts";


// ==================== 可见性 ====================
const VisibilityRadio = memo(() => {
    const { t } = useLanguage("tagBar");

    const { visible, setVisible } = useSignal(...tagStyleConfig("visible"))

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
    const { t } = useLanguage("tagBar");
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
const StyleModeRadio = () => {
    const { t } = useLanguage("tagBar");
    const tagStyleChanged = storeHub.getStore("tagStyle").useStoreChanged()
    const tagStyleReset = storeHub.getStore("tagStyle").reset

    const [mode, setMode] = useState<"default" | "custom">(tagStyleChanged ? "custom" : "default");

    useEffect(() => {
        setMode(tagStyleChanged ? "custom" : "default");
    }, [tagStyleChanged]);

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
                if (value === "default") tagStyleReset();
                setMode(value as "default" | "custom");
            }}
        />
    );
}

// ==================== 间距与圆角 ====================
const SpacingRadiusSection = memo(() => {
    const { t } = useLanguage("tagBar");

    const { radius, setRadius } = useSignal(...tagStyleConfig("radius"))
    const { gap, setGap } = useSignal(...tagStyleConfig("gap"))
    const { textPadding, setTextPadding } = useSignal(...tagStyleConfig("textPadding"))

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
    const { t } = useLanguage("tagBar");

    const { backgroundColor, setBackgroundColor } = useSignal(...tagStyleConfig("backgroundColor"))
    const { backgroundOpacity, setBackgroundOpacity } = useSignal(...tagStyleConfig("backgroundOpacity"))

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
    const { t } = useLanguage("tagBar");

    const { font, setFont } = useSignal(...tagStyleConfig("font"));
    const { fontSize, setFontSize } = useSignal(...tagStyleConfig("fontSize"))
    const { fontWeight, setFontWeight } = useSignal(...tagStyleConfig("fontWeight"))
    const { textColor, setTextColor } = useSignal(...tagStyleConfig("textColor"))
    const { textOpacity, setTextOpacity } = useSignal(...tagStyleConfig("textOpacity"))

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