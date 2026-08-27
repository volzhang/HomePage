import {Button} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {useRef, useState} from "react";
import {loadFonts} from "@/vol_apps/tool/action/loadFonts";
import type {FontItem} from "@/vol_apps/00_types/Types.ts";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {cmStore} from "@/vol_apps/cm/cm_atom.ts";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {usePopover} from "@/vol_apps/02_hooks/float/myPopover.tsx";
import {useMergeRefs} from "@/vol_apps/02_hooks/01_useMergeRefs.ts";

const FONT_DEFAULT = {
    fullName: "monospace",
    family: `monospace`
}

export const CmUiFontFamily = ({className}: { className?: string }) => {

    const {t} = useLanguage()
    const {fontMeta, setFontMeta} = useSignal(cmStore("fontMeta"));

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

    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const mergedAnchorRef = useMergeRefs(anchorRef, buttonRef);

    return (
        <>
            <Button ref={mergedAnchorRef} variant={"outline"}
                 className={className}
                    onClick={async () => {
						if (!open) await handleOpen()
                        setOpen(!open);
                    }}>
                {fontMeta.fullName}
            </Button>
            {floatingPortal(
                <div ref={floatingRef} style={floatingStyle}>
                    <div className={"w-75 h-fit border bg-popover p-0 rounded-md text-popover-foreground shadow-md outline-hidden"}>
                        <Command>
                            <CommandInput placeholder={t("search font ...")}/>
                            <CommandList className="max-h-160 overflow-y-auto">
                                <CommandEmpty>{t("No font found")}</CommandEmpty>
                                <CommandGroup
                                    // heading={t("Font List")}
                                >
                                    {fontList.length > 0
                                        ? fontList.map((item) => (
                                            <CommandItem key={item.fullName} onSelect={() => {
                                                setFontMeta(item);
                                                setOpen(false);
                                            }}>
                                                {item.fullName}
                                            </CommandItem>
                                        ))
                                        : <CommandItem onSelect={() => {
                                            // setFontMeta(item);
                                            setOpen(false);
                                        }}>
                                            {fontMeta.fullName}
                                        </CommandItem>
                                    }
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </div>
                </div>
            )}
        </>
    );
};

