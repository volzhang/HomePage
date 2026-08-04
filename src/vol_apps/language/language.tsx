import {Select} from "../01_components/01_SelectComponent"
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Languages} from "lucide-react";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {languageConfig} from "@/vol_apps/language/useLanguage.ts";

export const Language = () => {
    const {language, setLanguage, languageHydrated} = useSignal(languageConfig("language"))

    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            {
                languageHydrated &&
                <Select
                    value={language} onValueChange={(v) => {
                    setLanguage(v as "cn" | "en");
                }}
                    open={open} onOpenChange={setOpen}
                    duration={150} exitDuration={100}
                    scale={98}
                >
                    <Select.Trigger>
                        {/* Trigger 能自己搞定open状态 Button只是为了样式*/}
                        <Button variant="outline"
                                className={"opacity-0! hover:opacity-100! w-34 flex items-center justify-between animate-fade-in-scale"}>
                            <Languages className="size-4 text-foreground"/>
                            {language === "en" ? "English" : "简体中文"}
                            <Select.RotateIcon/>
                        </Button>
                    </Select.Trigger>
                    <Select.Content menuClassName={"w-34"}>
                        <Select.Option value="en">English</Select.Option>
                        <Select.Option value="cn">简体中文</Select.Option>
                    </Select.Content>
                </Select>}
        </>
    )
}