import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Languages} from "lucide-react";
import {useLanguageStore} from "@/vol_apps/language/language_store";

export const Language = () => {
    const {language, setLanguage} = useLanguageStore();
    return (
        <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className={"w-34 bg-background select-none"}>
                <Languages className={"text-foreground"}/>
                <SelectValue/>
            </SelectTrigger>
            <SelectContent position="popper">
                <SelectGroup>
                    <SelectItem value={"en"}>English</SelectItem>
                    <SelectItem value={"cn"}>简体中文</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}