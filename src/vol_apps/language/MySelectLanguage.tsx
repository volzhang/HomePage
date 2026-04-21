import { cn } from "@/lib/utils";
import { useState } from "react";
import { FloatingPanel } from "@/vol_apps/tool/animation/FloatingPanel";
import { CheckIcon, Languages } from "lucide-react";
import { useLanguageStore } from "@/vol_apps/language/language_store";

const TRIGGER_CLASS = cn(
    "flex items-center",
    "w-34 h-9",
    "text-foreground bg-background",
    "rounded-md border shadow-xs text-sm",
    "outline-none select-none",
    "hover:bg-accent hover:text-accent-foreground",
    "dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
);

const MENU_CLASS = cn(
    "absolute px-1 py-1",
    "border bg-popover text-popover-foreground rounded-md shadow-md",
    "z-1"
);

const ITEM_CLASS = cn(
    "flex items-center justify-between",
    "px-2 h-8 min-w-32 bg-background",
    "text-sm rounded-sm",
    "hover:bg-foreground/5",
    "whitespace-nowrap"
);

const options = [
    { label: "English", value: "en" },
    { label: "简体中文", value: "cn" },
] as const;

type LANGUAGE = "en" | "cn"

export const MySelectLanguage = () => {
    const { language, setLanguage } = useLanguageStore();
    const [isOpen, setIsOpen] = useState(false);

    const currentLabel = options.find(opt => opt.value === language)?.label ?? "English";

    const handleSelect = (value: LANGUAGE) => {
        setIsOpen(false);
        setTimeout(()=>setLanguage(value));
    };

    return (
        <div className="w-fit animate-fade-in-scale">
            <button onClick={() => setIsOpen(!isOpen)} className={cn(TRIGGER_CLASS)}>
                <div className="flex items-center justify-start pl-3">
                    <Languages className="size-4 text-foreground" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <span>{currentLabel}</span>
                </div>
                <div className="flex pr-3">
          <span
              className={cn(
                  "text-[12px] transition-transform duration-150 opacity-30",
                  isOpen && "rotate-180"
              )}
          >
            ▼
          </span>
                </div>
            </button>

            <div className="flex flex-fit">
                <FloatingPanel show={isOpen}>
                    <div className={cn(MENU_CLASS, "mt-1")}>
                        <ul className="flex flex-col">
                            {options.map(({ label, value }) => (
                                <button
                                    key={value}
                                    className={cn(ITEM_CLASS)}
                                    onClick={() => handleSelect(value)}
                                >
                                    {label}
                                    {language === value ? (
                                        <CheckIcon className="size-4" />
                                    ) : (
                                        <span className="size-4" />
                                    )}
                                </button>
                            ))}
                        </ul>
                    </div>
                </FloatingPanel>
            </div>
        </div>
    );
};