import type {BgLogic} from "@/vol_apps/bg/bg_logic";
import {useId} from "react";
import {ImgFilePickerBtn} from "@/vol_apps/tool/action/filePicker";
import {blobToString} from "@/vol_apps/tool/a2b/blobToString";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Folder, Image} from "lucide-react";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import type {BgType, SizeType} from "@/vol_apps/bg/bg_store";
import {useLanguageStore} from "@/vol_apps/language/language_store";
import {Drawer, DrawerContent, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle} from "@/components/ui/drawer";

const FONT_SIZE = "text-lg"

const BASE = cn("no-scrollbar overflow-y-auto",
    "flex flex-col gap-[10px] p-[10px]")

const BUTTON_CLASS = cn(
    "bg-background text-foreground border",
    "hover:bg-sBlue hover:text-white",
    "h-12 w-full", FONT_SIZE
)

const BORDER_CLASS = cn(
    "w-full pl-[12px] py-[15px] gap-[20px] rounded-md border",
    "bg-background text-foreground border",
    "hover:bg-secondary hover:text-secondary-foreground",
    "flex flex-col items-start justify-center"
)

const LABEL_CLASS = cn("p-0 m-0", FONT_SIZE)
const DIV_CLASS = "flex items-center gap-3 h-6 m-0 p-0"


const Content = (
    {
        handleDirChange,
        bgRepeat, bgCenter, otherVisible, bgSize, bgType,
        setBgType, setBgRepeat, setOtherVisible, setBgCenter, setBgImg, setBgSize,
        t,
    }: BgLogic
)=>{

    const id = useId();

    const bgTypeOptions = [
        {value: "bing", label: t("Daily Bing")},
        {value: "custom", label: t("Fixed Image")},
        {value: "custom_dir", label: t("Images Carousel")},
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


            {Array.from({ length: 0 }).map((_, index) => (
                <p
                    key={index}
                    className="mb-4 leading-normal style-lyra:mb-2 style-lyra:leading-relaxed"
                >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                    enim ad minim veniam, quis nostrud exercitation ullamco laboris
                    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat
                    nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                    sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
            ))}
        </div>
    )
}

const Btn = ({setBgUiVisible, setOtherVisible}:BgLogic) => {
    const {t} = useLanguageStore()
    return(
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
            modal={false}
            open={props.bgUiVisible}
            onOpenChange={props.setBgUiVisible}
            closeThreshold={0.75}
        >
            <DrawerContent className={"w-[18%]! max-w-[234px]!"}>
                <DrawerHeader hidden><DrawerTitle/><DrawerDescription/></DrawerHeader>
                <Content {...props}/>
                <DrawerFooter className={"h-fit pb-[10px] px-[10px]"}>
                    <DrawerClose asChild>
                        <Btn {...props}/>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}