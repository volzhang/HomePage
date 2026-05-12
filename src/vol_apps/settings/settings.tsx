import {type ElementType} from "react";
import {Bookmark, Search, SquareMousePointer, Wallpaper} from "lucide-react";
import {
    Drawer,
    // DrawerClose,
    DrawerContent,
    // DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import {cn} from "@/lib/utils";
import {useLanguageStore} from "@/vol_apps/language/language_store";
import {type BgLogic} from "@/vol_apps/bg/bg_logic";
import {Content} from "@/vol_apps/bg/bg_ui_settings";
import {Setting_tag} from "@/vol_apps/settings/setting_tag";
import {Setting_tiles} from "@/vol_apps/settings/setting_tiles";
import {Setting_search} from "@/vol_apps/settings/setting_search";
import {type SETTING_VALUE, useSettingStore} from "./setting_store";

const BG_COLOR = "bg-popover"
const TRANSITION_STYLE = "duration-200 ease-in-out"
const MAX_WIDTH = "w-[250px]"
const MIN_WIDTH = "w-[55px]"

const Option =
    ({
         value,
         onValueChange,
         checked,
         Icon,
         children,
     }: {
        value: SETTING_VALUE;
        onValueChange?: (value: SETTING_VALUE) => void;
        checked?: boolean;
        Icon: ElementType,
        children: string
    }) => {
        return (
            <>
                <label className={cn(
                    "relative group",
                    "flex flex-row items-center justify-start",
                    "text-[20px] font-bold",
                    "pl-[15px] pt-2 pb-[18px] gap-3",
                    "outline-0 border-0",
                    BG_COLOR,
                    checked ? "text-sBlue" : "text-ring/60",
                    checked ? MAX_WIDTH : MIN_WIDTH,
                    "transition-[width, color, opacity]", TRANSITION_STYLE
                )}
                >
                    <span className={cn("absolute left-[5%] h-[2.5px] z-30 rounded-full bottom-2.5",
                        checked ? "bg-sBlue" : "bg-ring/40 group-hover:bg-sBlue",
                        checked ? "w-[92%]" : "w-[70%] left-[15%]",
                        "transition-[width, color, opacity]", TRANSITION_STYLE
                    )}/>

                    <input value={value}
                           onChange={() => onValueChange?.(value)}
                           checked={checked}
                           type={"radio"} name="setting" className={"sr-only peer"}/>
                    <Icon className={cn("shrink-0 group-hover:text-sBlue",
                        !checked && "group-hover:-translate-y-0.5",
                        "transform-[translate, color]", TRANSITION_STYLE
                    )}/>
                    <p className={cn("whitespace-nowrap",
                        !checked && "opacity-0",
                        "transition-[color]", TRANSITION_STYLE
                    )}>{children}</p>
                </label>
            </>
        )
    }

export const Settings = (props: BgLogic) => {

    const {
        open, setOpen,
        value, setValue
    } = useSettingStore()

    const {t} = useLanguageStore()

    const OPTIONS: { value: SETTING_VALUE, label: string, Icon: ElementType } []
        = [
        {value: "search", label: t("SearchBar"), Icon: Search},
        {value: "tags", label: t("TagBar"), Icon: Bookmark},
        {value: "tiles", label: t("TileWall"), Icon: SquareMousePointer},
        {value: "background", label: t("Background"), Icon: Wallpaper},
    ]

    const getCase = () => {
        if (value === "background") return (
            <div className={"h-full w-full flex flex-col"}>
                <Content {...props}/>
                <div className={"w-full h-0.5 shrink-0"}></div>
            </div>
        )
        if (value === "tags") return <Setting_tag/>;
        if (value === "search") return <Setting_search/>;
        if (value === "tiles") return <Setting_tiles/>;

        return <div className={"flex h-20 text-md items-center mx-auto text-foreground"}>Coming Soon</div>
    }

    return (
        <>
            <Drawer open={open} onOpenChange={setOpen} direction={"right"} closeThreshold={0.8}>
                <DrawerContent
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setOpen(false)
                    }}
                    className={cn("min-w-[400px]! w-fit! border-0! bg-transparent pt-1 pr-1")}>
                    <DrawerHeader hidden><DrawerTitle/><DrawerDescription/></DrawerHeader>
                    <div className={"rounded-sm shadow-sBlue shadow-lg overflow-hidden"}>
                        <div className={cn("flex flex-row")}>
                            {OPTIONS.map((item) => (
                                <Option key={item.value} checked={item.value === value} Icon={item.Icon}
                                        value={item.value} onValueChange={setValue}>
                                    {item.label}
                                </Option>
                            ))}
                        </div>
                        <div className={cn(
                            "no-scrollbar overflow-y-auto max-h-[95%]",
                            "p-1 mt-0 z-10",
                            "flex justify-center",
                            "border-0 outline-0",
                            "bg-popover",
                            "rounded-b-md",
                            value === "background" && "rounded-tr-none",
                            value === "search" && "rounded-tl-none",
                        )}
                        >
                            {getCase()}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    )
}



