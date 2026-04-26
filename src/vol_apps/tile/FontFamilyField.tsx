import {useState} from "react";
import type {FontItem} from "@/vol_apps/cm/cm_store";
import {loadFonts} from "@/vol_apps/tool/action/loadFonts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {useLanguageStore} from "@/vol_apps/language/language_store";

export const FONT_DEFAULT = {
    fullName: "System Default",
    family: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif`
}

interface FontFamilyProps {
    value: { fullName: string; family: string };
    onChange: (value: { fullName: string; family: string }) => void;
}

export const FontFamily = ({value, onChange}: FontFamilyProps) => {
    const {t} = useLanguageStore()
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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className={"grid grid-cols-2 w-full items-center"}>
                    <p>{t("Font")}</p>
                    <div className={"flex items-center border px-1"}
                         onClick={handleOpen}>
                        {value.fullName}
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-75 p-0" align="start" side="right">
                <Command>
                    <CommandInput placeholder={t("search font ...")}/>
                    <CommandList className="max-h-160 overflow-y-auto">
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
            </PopoverContent>
        </Popover>
    );
};