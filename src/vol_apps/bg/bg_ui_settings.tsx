import type {BgLogic} from "@/vol_apps/bg/bg_logic";
import {useId} from "react";
import {ImgFilePickerBtn} from "@/vol_apps/tool/action/filePicker";
import {blobToString} from "@/vol_apps/tool/a2b/blobToString";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Folder, Image, MessageCircleHeart} from "lucide-react";
import type {BgType, SizeType} from "@/vol_apps/bg/bg_store";


const BUTTON_CLASS = cn(
    "border bg-popover text-foreground",
    "flex items-center justify-center",
    "hover:bg-sBlue hover:text-white rounded-[2px]",
    "h-[36px] text-md w-[calc(100%-1rem)] mx-2",
)

export const MyRadio = (
    {
        title,
        options,
        children,

        value,
        onValueChange,
    }: {
        title: string,
        options: { value: string, label: string }[],
        children?: React.ReactNode,

        value?: string;
        onValueChange?: (value: string) => void;
    }
) => {
    const name = useId();
    return (
        <>
            <fieldset className={cn(
                "group",
                "relative border border-transparent",
                "min-w-0",
                "grid grid-cols-2 border rounded-[2px]",
                "mt-3 pt-6 pb-2 px-2 gap-1.5",
                "hover:border-sBlue",
                "hover:ring-sBlue hover:ring",
                "transition-colors duration-250 linear"
            )}>
                <legend className={cn(
                    "text-lg text-left text-border font-semibold",
                    "absolute -top-3.5 left-[3px]",
                    "bg-popover whitespace-nowrap px-1.5",
                    "group-hover:text-sBlue",
                    "transition-colors duration-250 linear"
                )}>{title}</legend>
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={cn("group col-span-1 flex flex-row")}>
                        <input
                            type="radio"
                            className={"sr-only"}
                            onChange={() => onValueChange?.(option.value)}
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                        ></input>
                        <p className={cn(
                            "border w-[200px] h-[34px] text-sm rounded-[2px]",
                            "flex items-center justify-center",
                            option.value === value && "text-white bg-sBlue",
                            "transition-colors duration-250 linear"
                        )}>
                            {option.label}
                        </p>
                    </label>
                ))}
                {children}
            </fieldset>
        </>
    )
}

export const Content = (
    {
        handleDirChange,
        bgRepeat, bgCenter, otherVisible, bgSize, bgType,
        setBgType, setBgRepeat, setOtherVisible, setBgCenter, setBgImg, setBgSize,
        carouselRandom, setCarouselRandom,
        carouselInterval, setCarouselInterval,
        t,
    }: BgLogic
) => {

    const bgTypeOptions = [
        {value: "bing", label: t("Bing Wallpaper")},
        {value: "default", label: t("Reset Defaults")},
        {value: "custom", label: t("Single Image")},
        {value: "custom_dir", label: t("Image Carousel")},

    ];
    const visibleOptions = [
        {value: "false", label: t("Background Only")},
        {value: "true", label: t("Show All")},
    ];
    const repeatOptions = [
        {value: "repeat", label: t("Repeat")},
        {value: "no-repeat", label: t("Once")},
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

    const carouselOptions = [
        {value: "random", label: t("Random")},
        {value: "sequential", label: t("Sequential")},
    ];

    return (
        <div className={cn(
            "flex flex-col gap-3 p-1 items-center justify-center text-md",
            "bg-popover text-foreground"
        )}>
            <Button variant={"default"} className={cn("gap-5 mx-2", BUTTON_CLASS)} onClick={handleDirChange}>
                <Folder className={"scale-x-120 scale-y-120"}/>
                {t("Choose Folder")}
            </Button>
            <ImgFilePickerBtn
                className={"w-full"}
                onPick={async (file) => {
                    setBgImg(await blobToString(file));
                    setBgType("custom");
                }}
                children={
                    <Button
                        variant={"default"}
                        className={cn(BUTTON_CLASS, "gap-5 w-[calc(100%-1rem)] mx-2 text-md")}>
                        <Image className={"scale-x-130 scale-y-115"}/>
                        {t("Choose Image")}
                    </Button>
                }/>
            <MyRadio title={t("Background Type")}
                     options={bgTypeOptions}
                     value={bgType}
                     onValueChange={async (value) => setBgType(value as BgType)}/>

            <MyRadio title={t("Preview")}
                     options={visibleOptions}
                     value={otherVisible ? "true" : "false"}
                     onValueChange={(value) => setOtherVisible(value === "true")}/>

            <MyRadio title={t("Repeat")}
                     options={repeatOptions}
                     value={bgRepeat ? "repeat" : "no-repeat"}
                     onValueChange={(value) => setBgRepeat(value === "repeat")}/>

            <MyRadio title={t("Position")}
                     options={centerOptions}
                     value={bgCenter ? "center" : "not-center"}
                     onValueChange={(value) => setBgCenter(value === "center")}/>

            <MyRadio title={t("Image Size")}
                     options={sizeOptions} value={bgSize}
                     onValueChange={(value) => setBgSize(value as SizeType)}/>

            <MyRadio title={t("Image Carousel")}
                     options={carouselOptions}
                     value={
                         bgType === "custom_dir"
                             ? carouselRandom ? "random" : "sequential"
                             : ""
                     }
                     onValueChange={(value) => {
                         setCarouselRandom(value === "random")
                         setBgType("custom_dir")
                     }}
            >
                {/* 切图间隔 */}
                <label className={cn("col-span-2 h-[34px] grid grid-cols-2 mt-2 gap-1 pl-1 text-md",
                    bgType === "custom_dir"
                        ? "text-sBlue font-semibold"
                        : "opacity-15 group-hover:opacity-100",
                )
                }>
                    <p className={"flex items-center"}>{t("Change every")}</p>
                    <div className={"flex flex-row gap-1"}>
                        <input type={"number"} min={1} max={60 * 60 * 24}
                               className={cn("flex-1 min-w-0 rounded-sm border border-border/50 text-right ring-0 outline-0",
                                   "transition-all duration-250 linear"
                               )}
                               value={carouselInterval}
                               onChange={(e) => {
                                   const MAX = 60 * 60 * 24;
                                   const MIN = 1;
                                   const value = Math.min(Math.max(parseInt(e.target.value), MIN), MAX);
                                   setCarouselInterval(value);
                               }}
                        ></input>
                        <p className={"flex items-center"}>{t("sec")}</p>
                    </div>
                </label>
                {/* 操作提示 */}
                <p className={cn("col-span-2 mt-2 items-center justify-center text-md")}>
                    <span className={cn("flex items-start gap-2", "transition-all duration-250 linear",
                        bgType === "custom_dir"
                            ? "text-sBlue font-semibold "
                            : "opacity-20 group-hover:opacity-100",
                    )}>
                        <MessageCircleHeart className="shrink-0 ml-1"/>
                        {bgType === "custom_dir"
                            ?
                            <span className="leading-relaxed">
                                {t("Double-click on empty space to go to the next image.")}
                            </span>
                            :
                            <span className="leading-relaxed">
                                {t("This feature is currently not enabled.")}
                            </span>
                        }
                    </span>
                </p>
            </MyRadio>
        </div>
    )
}