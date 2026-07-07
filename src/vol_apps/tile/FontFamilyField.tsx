import {useState} from "react";
import {loadFonts} from "@/vol_apps/tool/action/loadFonts";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import type {FontItem} from "@/vol_apps/00_types/Types.ts";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {usePopover} from "@/vol_apps/02_hooks/float/myPopover.tsx";

export const FONT_DEFAULT = {
    fullName: "System Default",
    family: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif`
}

interface FontFamilyProps {
    value: { fullName: string; family: string };
    onChange: (value: { fullName: string; family: string }) => void;
    PopoverContentSide?: "right" | "left" | "bottom" | "top";
}

export const FontFamily = ({value, onChange}: FontFamilyProps) => {
    const {t} = useLanguage()
    // noinspection DuplicatedCode
    const [open, setOpen] = useState(false);
    const [fontList, setFontList] = useState<FontItem[]>([]);

    const handleOpen = async () => {
        try {
            const loadedFonts = await loadFonts();
            // 把 System Default 放在第一位
            const newList: FontItem[] = [FONT_DEFAULT, ...loadedFonts];
            setFontList(newList);
        } catch (error) {
            console.error("加载字体失败", error);
            setFontList([FONT_DEFAULT]);
        }
    };

    const {
        anchorRef, floatingRef, floatingPortal, floatingStyle
    } = usePopover({
        open,
        onOpenChange: setOpen,
        direction: "bottom",
        align: "start",
        duration: 200,
        exitDuration: 200,
        offset: 4,
        zIndex: 40,
        scale: 95,
    })


    return (
        <>
            <div className={"grid grid-cols-2 w-full items-center"} ref={anchorRef}>
                <p>{t("Font")}</p>
                <div className={"flex items-center border px-1"}
                     onClick={handleOpen}>
                    {value.fullName}
                </div>
            </div>
            {floatingPortal(
                <div ref={floatingRef} style={floatingStyle}>
                    <div className={"w-75 h-fit border bg-popover p-0 rounded-md text-popover-foreground shadow-md outline-hidden"}>
                        <Command>
                            <CommandInput placeholder={t("search font ...")}/>
                            <CommandList className="overflow-y-auto max-h-[600px]">
                                <CommandEmpty>{t("No font found")}</CommandEmpty>
                                <CommandGroup heading={t("Font List")}>
                                    {fontList.map((item) => (
                                        <CommandItem
                                            key={item.fullName}
                                            onSelect={() => {
                                                onChange(item);
                                                setOpen(false);
                                            }}>
                                            {item.fullName}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </div>
                </div>
            )}
        </>
    );
};