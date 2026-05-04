import {Button} from "@/components/ui/button";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

import {cn} from "@/lib/utils";
import {type BgType, type SizeType} from "@/vol_apps/bg/bg_store";
import {blobToString} from "@/vol_apps/tool/a2b/blobToString";
import {ImgFilePickerBtn} from "@/vol_apps/tool/action/filePicker";
import {Folder} from "lucide-react";
import {useId} from "react";
import type {BgLogic} from "@/vol_apps/bg/bg_logic";
import {useFloating} from "@/vol_apps/02_hooks/useFloating";

export function BgUiSetting(
    {
        bgRepeat, bgCenter, otherVisible, bgUiVisible, bgSize, bgType,
        setBgType, setBgRepeat, setOtherVisible, setBgCenter, setBgImg, setBgSize, setBgUiVisible,
        t,
    }: BgLogic) {
    const id = useId();

    const bgTypeOptions = [
        {value: "bing", label: t("DailyBing")},
        {value: "custom", label: t("Custom")},
        {value: "default", label: t("Reset Defaults")},
    ];
    const visibleOptions = [
        {value: "true", label: t("Default View")},
        {value: "false", label: t("Hide Others")},
    ];
    const repeatOptions = [
        {value: "repeat", label: t("Repeat")},
        {value: "no-repeat", label: t("Single")},
    ];
    const centerOptions = [
        {value: "not-center", label: t("Top Left")},
        {value: "center", label: t("Center")},
    ];
    const sizeOptions = [
        {value: "auto", label: t("Original Size")},
        {value: "contain", label: t("Contain")},
        {value: "cover", label: t("Cover")},
    ];

    const BUTTON_CLASS = cn(
        "bg-secondary border-secondary text-secondary-foreground",
        "hover:bg-background hover:text-secondary-foreground",
        "w-full text-[16px]",
    )
    const BORDER_CLASS = cn(
        "w-full pl-[12px] py-[12px] gap-[12px] rounded-md",
        "border border-secondary bg-secondary hover:bg-background",
        "flex flex-col items-start justify-center"
    )
    const LABEL_CLASS = "text-[16px] p-0 m-0"
    const DIV_CLASS = "flex items-center gap-2 h-6 m-0 p-0"

    const {anchorRef, floatingRef, floatingStyle} = useFloating({
        open: bgUiVisible,
        direction: "bottom",
        align: "end",
        offset: 0,
        duration: 200,
        exitDuration: 200,
    })

    return (
        <>
            <div ref={anchorRef} className={"fixed top-0 right-0 w-0 h-0"}>
            </div>
            <div className={cn("pt-2 pr-2 w-[160px] gap-3 flex flex-col",
                //添加类 bg-ui-panel，供全局 CSS 识别。
                "bg-ui-panel")}
                 ref={floatingRef}
                 style={floatingStyle}
            >

                {/* 上传背景图 */}
                <ImgFilePickerBtn
                    onPick={async (file) => {
                        setBgImg(await blobToString(file));
                        setBgType("custom");
                    }}
                    children={
                        <Button
                            variant={"default"}
                            className={cn(BUTTON_CLASS, "h-11")}>
                            <Folder className={`scale-120`}/>
                            {t("Upload Image")}
                        </Button>
                    }/>
                {/* 背景类型 */}
                <RadioGroup
                    value={bgType}
                    onValueChange={async (value) => {
                        setBgType(value as BgType)
                    }}
                    className={BORDER_CLASS}
                >
                    {bgTypeOptions.map((opt) => {
                        const rid = `${id}-${opt.value}`;
                        return (
                            <div key={opt.value} className={cn(DIV_CLASS)}>
                                <RadioGroupItem value={opt.value} id={rid}/>
                                <label htmlFor={rid} className={cn(LABEL_CLASS)}>
                                    {opt.label}
                                </label>
                            </div>
                        );
                    })}
                </RadioGroup>

                {/* 只看背景 */}
                <RadioGroup
                    defaultValue={otherVisible ? "true" : "false"}
                    onValueChange={(value) => setOtherVisible(value === "true")}
                    className={BORDER_CLASS}
                >
                    {visibleOptions.map((opt) => {
                        const rid = `${id}-visible-${opt.value}`;
                        return (
                            <div key={opt.value} className={cn(DIV_CLASS)}>
                                <RadioGroupItem value={opt.value} id={rid}/>
                                <label htmlFor={rid} className={LABEL_CLASS}>
                                    {opt.label}
                                </label>
                            </div>
                        );
                    })}
                </RadioGroup>
                {/* 重复显示 */}
                <RadioGroup
                    value={bgRepeat ? "repeat" : "no-repeat"}
                    onValueChange={(value) => setBgRepeat(value === "repeat")}
                    className={BORDER_CLASS}
                >
                    {repeatOptions.map((opt) => {
                        const rid = `${id}-repeat-${opt.value}`;
                        return (
                            <div key={opt.value} className={cn(DIV_CLASS)}>
                                <RadioGroupItem value={opt.value} id={rid}/>
                                <label htmlFor={rid} className={LABEL_CLASS}>
                                    {opt.label}
                                </label>
                            </div>
                        );
                    })}
                </RadioGroup>
                {/* 居中显示 */}
                <RadioGroup
                    value={bgCenter ? "center" : "not-center"}
                    onValueChange={(value) => setBgCenter(value === "center")}
                    className={BORDER_CLASS}
                >
                    {centerOptions.map((opt) => {
                        const rid = `${id}-center-${opt.value}`;
                        return (
                            <div key={opt.value} className={cn(DIV_CLASS)}>
                                <RadioGroupItem value={opt.value} id={rid}/>
                                <label htmlFor={rid} className={LABEL_CLASS}>
                                    {opt.label}
                                </label>
                            </div>
                        );
                    })}
                </RadioGroup>
                {/* 自定义大小 */}
                <RadioGroup
                    value={bgSize}
                    onValueChange={(value) => setBgSize(value as SizeType)}
                    className={BORDER_CLASS}
                >
                    {sizeOptions.map((opt) => {
                        const rid = `${id}-size-${opt.value}`;
                        return (
                            <div key={opt.value} className={cn(DIV_CLASS)}>
                                <RadioGroupItem value={opt.value} id={rid}/>
                                <label htmlFor={rid} className={LABEL_CLASS}>
                                    {opt.label}
                                </label>
                            </div>
                        );
                    })}
                </RadioGroup>
                <Button
                    onClick={() => {
                        setBgUiVisible(false);
                        setOtherVisible(true);
                    }}
                    variant={"default"}
                    className={cn(BUTTON_CLASS, "h-[46px]")}>
                    {t("OK")}
                </Button>

            </div>
        </>
    );
}
