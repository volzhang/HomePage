import {type LANGUAGE, useLanguageStore} from "@/vol_apps/language/language_store";
import {Select} from "../01_components/Select";
import {useMemo, useState} from "react";
import {cn} from "@/lib/utils";
import {Languages} from "lucide-react";
import {RotateOnOpen} from "@/vol_apps/01_components/RotateOnOpen";

const TRIGGER_CLASS = cn(
    "flex items-center justify-between",
    "w-34 h-9 px-3",
    "text-foreground bg-background",
    "rounded-md border shadow-xs text-sm",
    "outline-none select-none",
    "hover:bg-accent hover:text-accent-foreground",
    "dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
);

const options = [
    {label: "English", value: "en"},
    {label: "简体中文", value: "cn"},
];

export const LanguageUi = () => {

    const {language, setLanguage} = useLanguageStore();
    const [open, setOpen] = useState(false);

    const toggle = () => setOpen(!open)
    const currentLabel = useMemo(
        () => options.find(option => option.value === language)?.label ?? "", [language]
    )

    const Tigger =
        <button onClick={toggle} className={cn(TRIGGER_CLASS)}>
            <Languages className="size-4 text-foreground"/>
            <span>{currentLabel}</span>
            <RotateOnOpen open={open}/>
        </button>

    return (
        <Select
            open={open}
            onOpenChange={setOpen}
            options={options}
            value={language}
            onValueChange={(v) => setLanguage(v as LANGUAGE)}
            trigger={Tigger}
        >
        </Select>
    );
};