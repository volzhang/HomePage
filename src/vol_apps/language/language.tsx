import {type LANGUAGE, useLanguageStore} from "@/vol_apps/language/language_store";
import {Select} from "../01_components/01_SelectComponent"
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Languages} from "lucide-react";

export const Language = () => {
    const {language, setLanguage} = useLanguageStore();
    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            <Select
                value={language} onValueChange={(v) => {
                    setLanguage(v as LANGUAGE);
            }}
                open={open} onOpenChange={setOpen}
                duration={200} exitDuration={200}
            >
                <Select.Trigger>
                    {/* Trigger 能自己搞定open状态 Button只是为了样式*/}
                    <Button variant="outline" className={"w-34 flex items-center justify-between"}>
                        <Languages className="size-4 text-foreground"/>
                        {language === "en" ? "English" : "简体中文"}
                        <Select.RotateIcon/>
                    </Button>
                </Select.Trigger>
                <Select.Content menuClassName={"w-34"}>
                    <Select.Option value="en">English</Select.Option>
                    <Select.Option value="cn">简体中文</Select.Option>
                </Select.Content>
            </Select>
        </>
    )
}