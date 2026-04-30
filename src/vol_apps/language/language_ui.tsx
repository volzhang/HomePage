import {type LANGUAGE, useLanguageStore} from "@/vol_apps/language/language_store";
import {Select} from "../01_components/Select";
import {useMemo, useState} from "react";
import {Languages} from "lucide-react";
import {RotateOnOpen} from "@/vol_apps/01_components/RotateOnOpen";
import {Button} from "@/components/ui/button";

const TRIGGER_CLASS = "w-34 flex items-center justify-between"

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
        <Button variant="outline" className={TRIGGER_CLASS} onClick={toggle}>
            <Languages className="size-4 text-foreground"/>
            <span>{currentLabel}</span>
            <RotateOnOpen open={open}/>
        </Button>

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