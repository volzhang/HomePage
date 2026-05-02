import {type LANGUAGE, useLanguageStore} from "@/vol_apps/language/language_store";
import {Content, Option, SelectComponent, Trigger} from "../01_components/SelectComponent";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {RotateOnOpen} from "@/vol_apps/01_components/RotateOnOpen";
import { Languages } from "lucide-react";

const TRIGGER_CLASS = "w-34 flex items-center justify-between"

export const Language = () => {
    const {language, setLanguage} = useLanguageStore();
    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            <SelectComponent
                value={language} onValueChange={(v) => setLanguage(v as LANGUAGE)}
                open={open} onOpenChange={setOpen}
                duration={200}
            >
                <Trigger>
                    {/* Trigger 能自己搞定open状态 */}
                    <Button variant="outline" className={TRIGGER_CLASS}>
                        <Languages className="size-4 text-foreground"/>
                        {language === "en" ? "English" : "简体中文"}
                        <RotateOnOpen open={open} duration={200}/>
                    </Button>
                </Trigger>
                <Content>
                    <Option value="en">English</Option>
                    <Option value="cn">简体中文</Option>
                </Content>
            </SelectComponent>
        </>
    )
}