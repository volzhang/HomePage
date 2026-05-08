import type {BgLogic} from "@/vol_apps/bg/bg_logic";
import {useId} from "react";
import {ImgFilePickerBtn} from "@/vol_apps/tool/action/filePicker";
import {blobToString} from "@/vol_apps/tool/a2b/blobToString";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Folder, Image} from "lucide-react";
import type {BgType, SizeType} from "@/vol_apps/bg/bg_store";
import {useLanguageStore} from "@/vol_apps/language/language_store";
import {
    Drawer,
    DrawerContent,
    DrawerClose,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle
} from "@/components/ui/drawer";


const BG = "bg-popover hover:ring-sBlue hover:ring-2 hover:border-sBlue"

const BASE = cn("no-scrollbar overflow-y-auto",
    "flex flex-col gap-[10px] p-[10px] h-full",
    "bg-popover text-foreground"
)

const BUTTON_CLASS = cn(
    "border text-foreground", BG,
    "hover:bg-sBlue hover:text-white",
    "h-12 w-full", "text-lg"
)


const MyRadio = (
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
    const handleChange = (selectedValue: string) => {
        onValueChange?.(selectedValue);
    };

    return (
        <>
            <fieldset className={cn(
                "group", "text-lg",
                "relative rounded-md border",
                "min-w-0",
                "grid grid-cols-2",
                "mt-3 pt-7 pb-6 gap-y-3",
                "hover:border-sBlue hover:ring-sBlue hover:ring-2",
                "transition-all duration-200 linear"
            )}>
                <legend className={cn(
                    "text-lg text-left text-border",
                    "absolute -top-3.5 left-3",
                    "bg-popover whitespace-nowrap px-1.5",
                    "group-hover:text-sBlue group-hover:font-semibold",
                    "transition-all duration-200 linear"
                )}>{title}</legend>
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={"col-span-1 flex flex-row ml-4 gap-2"}>
                        <input
                            type="radio"
                            onChange={() => handleChange(option.value)}
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                        ></input>
                        <p className={"whitespace-nowrap"}>{option.label}</p>
                    </label>
                ))}
                {children}
            </fieldset>
        </>
    )
}

const Content = (
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
        {value: "default", label: t("Reset Defaults")},
        {value: "bing", label: t("Daily Bing")},
        {value: "custom", label: t("Fixed Image")},
        {value: "custom_dir", label: t("Images Carousel")},

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

    const carouselOptions = [
        {value: "random", label: t("Random")},
        {value: "normal", label: t("Normal")},
    ];

    return (
        <div className={BASE}>
            <Button variant={"default"} className={cn(BUTTON_CLASS)} onClick={handleDirChange}>
                <Folder className={"scale-125 -translate-x-4"}/>
                <p className={"-translate-x-2"}>{t("Select Fonder")}</p>
            </Button>
            <ImgFilePickerBtn
                onPick={async (file) => {
                    setBgImg(await blobToString(file));
                    setBgType("custom");
                }}
                children={
                    <Button
                        variant={"default"}
                        className={cn(BUTTON_CLASS)}>
                        <Image className={"scale-125 -translate-x-4"}/>
                        <p className={"-translate-x-2"}>{t("Choose Image")}</p>
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

            <MyRadio title={t("Size")}
                     options={sizeOptions} value={bgSize}
                     onValueChange={(value) => setBgSize(value as SizeType)}/>

            <MyRadio title={t("Images Carousel")}
                     options={carouselOptions}
                     value={
                         bgType === "custom_dir"
                             ? carouselRandom ? "random" : "normal"
                             : ""
                     }
                     onValueChange={(value) => {
                         setCarouselRandom(value === "random")
                         setBgType("custom_dir")
                     }}
            >
                <label className={"col-span-2 mt-3 ml-5 flex flex-row gap-2"}>
                    <p className={"flex w-32"}>
                        {t("Switch every")}
                    </p>
                    <input type={"number"} min={1} max={60 * 60 * 24}
                           className={cn("flex-1 min-w-0 rounded-sm border border-border/50 ",
                               "text-right ring-0 outline-0",
                               "text-sBlue font-bold",
                               "group-hover:border-sBlue/50",
                           )}
                           value={carouselInterval}
                           onChange={(e) => {
                               const MAX = 60 * 60 * 24;
                               const MIN = 1;
                               const value = Math.min(Math.max(parseInt(e.target.value), MIN), MAX);
                               setCarouselInterval(value);
                           }}
                    ></input>
                    <p className={"flex w-20"}>{t("sec")}</p>
                </label>
            </MyRadio>
        </div>
    )
}

const Btn = ({setBgUiVisible, setOtherVisible}: BgLogic) => {
    const {t} = useLanguageStore()
    return (
        <Button
            onClick={() => {
                setBgUiVisible(false);
                setOtherVisible(true);
            }}
            variant={"default"}
            className={cn(BUTTON_CLASS, "bg-secondary text-secondary-foreground")}>
            {t("OK")}
        </Button>
    )
}

export const BgUiSettings = (props: BgLogic) => {

    return (
        <Drawer
            direction="right"
            modal={true}
            open={props.bgUiVisible}
            onOpenChange={props.setBgUiVisible}
            closeThreshold={0.6}
        >
            <DrawerContent className={"w-[30%]! max-w-[410px]! min-w-[390px]!"}>
                <DrawerHeader hidden><DrawerTitle/><DrawerDescription/></DrawerHeader>
                <Content {...props}/>
                <DrawerFooter className={"h-fit pb-2.5 px-2.5 bg-popover"}>
                    <DrawerClose asChild>
                        <Btn {...props}/>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}