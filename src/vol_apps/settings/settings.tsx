import {type ElementType, useEffect, useState} from "react";
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


const BORDER_COLOR = "border-sBlue/70"

const Option =
    ({
         value,
         onValueChange,
         checked,
         Icon,
         children,

     }: {
        value: string;
        onValueChange?: (value: string) => void;
        checked?: boolean;
        Icon: ElementType,
        children: string

    }) => {
        return (
            <>
                <label className={cn(
                    "relative group",
                    "flex flex-row items-center justify-start",
                    "rounded-t-sm text-2xl font-bold",
                    "h-fit",
                    "pl-3 py-2 gap-3",
                    "my-0 mx-0",
                    "whitespace-nowrap",
                    "bg-popover",
                    "border-2",
                    checked ? "z-20" : "z-0",
                    checked ? "text-sBlue" : "text-foreground",
                    checked ? BORDER_COLOR : "border-border border-b-transparent",
                    // checked ? "border-popover" : "border-popover border-b-transparent",
                    checked ? "w-[300px]" : "w-[52px]",
                    "transition-[width,color,background-color,transform,opacity] duration-250 ease-in-out",
                )}
                >
                    <span className={cn("absolute -right-0.5 -bottom-2 w-0.5 h-2",
                        Icon === Wallpaper && !checked ? "bg-popover" : "bg-transparent",
                        "transition-colors duration-250 ease-in-out",
                    )}/>

                    <span className={cn("absolute -left-0.5 -bottom-2 w-0.5 h-2",
                        Icon === Search && !checked ? "bg-popover" : "bg-transparent",
                        "transition-colors duration-250 ease-in-out",
                    )}/>

                    <span className={cn("absolute left-0 -bottom-0.5 w-full h-0.5 z-30",
                        checked ? "bg-popover" : "bg-transparent",
                        "transition-colors duration-250 ease-in-out",
                    )}/>
                    <input value={value}
                           onChange={() => onValueChange?.(value)}
                           checked={checked}
                           type={"radio"} name="setting" className={"sr-only peer"}/>
                    <Icon className={cn(
                        "scale-85 shrink-0",
                        !checked && "group-hover:scale-93",
                        checked && "scale-100",
                        "transition-[color, scale] duration-250 ease-in-out",
                    )}/>
                    <p className={cn(checked ? "text-sBlue" : "text-transparent",
                        "transition-colors duration-250 ease-in-out",
                    )}>{children}</p>
                </label>
            </>
        )
    }


export const Settings = (props: BgLogic) => {

    useEffect(() => {
        if (props.bgUiVisible) {
            setValue("background")
        }

    }, [props.bgUiVisible])

    const [value, setValue] = useState("search")

    const {t} = useLanguageStore()

    const OPTIONS: { value: string, label: string, Icon: ElementType } []
        = [
        {value: "search", label: t("SearchBar"), Icon: Search},
        {value: "tags", label: t("TagBar"), Icon: Bookmark},
        {value: "tiles", label: t("TileWall"), Icon: SquareMousePointer},
        {value: "background", label: t("Background"), Icon: Wallpaper},
    ]

    return (
        <>
            {/*<Button variant={"outline"} onClick={() => setOpen(!open)}>设置</Button>*/}
            <Drawer open={props.bgUiVisible}
                    onOpenChange={props.setBgUiVisible}
                    direction={"right"}
                    closeThreshold={0.8}
            >

                <DrawerContent className={"min-w-[400px] w-fit! bg-transparent border-transparent p-2"}>
                    <DrawerHeader hidden><DrawerTitle/><DrawerDescription/></DrawerHeader>
                    <div className={cn("flex flex-row gap-1")}>
                        {OPTIONS.map((item) => (
                            <Option
                                key={item.value}
                                checked={item.value === value}
                                Icon={item.Icon}
                                value={item.value}
                                onValueChange={setValue}>
                                {item.label}
                            </Option>
                        ))}
                    </div>
                    <div className={cn(
                        "no-scrollbar overflow-y-auto py-4 mb-0",
                        "flex justify-center",
                        "z-10 -mt-0.5 pb-1",
                        "border-2",
                        "bg-popover",
                        "border-popover",
                        BORDER_COLOR,
                        "rounded-md",
                        value === "background" && "rounded-tr-none",
                        value === "search" && "rounded-tl-none",
                    )}
                    >
                        {value === "background"
                            ?
                            <div className={"h-fit flex flex-col"}>
                                <Content {...props}/>
                                <div className={"w-full h-3"}></div>
                            </div>
                            :
                            <div className={"flex h-9 text-md mx-auto text-foreground"}>
                                Coming Soon
                            </div>}
                    </div>
                </DrawerContent>
            </Drawer>
        </>

    )
}
