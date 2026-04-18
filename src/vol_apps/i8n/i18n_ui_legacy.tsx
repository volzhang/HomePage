import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useI18nStore} from "@/vol_apps/i8n/i18n_store";
import {Languages} from "lucide-react";

export const I18nUi = () => {
    const {language, setLanguage} = useI18nStore();
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