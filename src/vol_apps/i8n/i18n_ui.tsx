import {cn} from "@/lib/utils";
import {useI18nStore} from "@/vol_apps/i8n/i18n_store";
import {Check, Languages} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {FloatingPanel} from "@/vol_apps/menu/FloatingPanel";

const items = [
    {label: "English", value: "en"},
    {label: "简体中文", value: "cn"},
] as const;

const TRIGGER_CLASS = cn(
    "w-36 select-none",
    "flex items-center justify-between gap-2",
    "h-9 px-3 py-2",
    "rounded-md border bg-background shadow-xs",
    "text-sm whitespace-nowrap",
    "outline-none",
    "hover:bg-accent hover:text-accent-foreground",
    "dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
);

const MENU_CLASS = cn(
    "animate-pop",
    "flex flex-col z-10 mt-1 rounded-md",
    "border bg-popover text-popover-foreground shadow-md",
    "select-none"
);

const ITEM_CLASS = cn(
    "relative m-1 px-2 py-1.5 pr-8 text-left text-sm rounded-sm",
    "hover:bg-foreground/10"
);

const CHECK_CLASS = "absolute right-3 top-1/2 size-4 -translate-y-1/2";

export const I18nUi = () => {
    const {language, setLanguage} = useI18nStore();
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (rootRef.current?.contains(target)) return;
            setIsOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen]);

    const currentItem = items.find((item) => item.value === language) ?? items[0];

    const handleSelect = (value: string) => {
        setLanguage(value);
        setIsOpen(false);
    };

    return (
        <div ref={rootRef} className="relative w-fit animate-fade-in-scale">
            <button onClick={() => setIsOpen(!isOpen)} className={TRIGGER_CLASS}>
                <Languages className="size-4 text-foreground"/>
                <span className="flex-1 text-center">{currentItem.label}</span>
                <span
                    className={cn(isOpen && "rotate-180", "text-xs opacity-30 transition-transform duration-200")}>▼</span>
            </button>
            <FloatingPanel show={isOpen}>
                <div className={cn(MENU_CLASS)}>
                    {items.map((item) => {
                        const selected = item.value === language;
                        return (
                            <button key={item.value} onClick={() => handleSelect(item.value)} className={ITEM_CLASS}>
                                {item.label}
                                {selected && <Check className={CHECK_CLASS}/>}
                            </button>
                        );
                    })}
                </div>
            </FloatingPanel>
        </div>
    );
};