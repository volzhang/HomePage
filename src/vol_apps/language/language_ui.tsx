import {type LANGUAGE, useLanguageStore} from "@/vol_apps/language/language_store";
import {MySelect} from "@/vol_apps/01_components/MySelect";

const options = [
    { label: "English", value: "en" },
    { label: "简体中文", value: "cn" },
];

export const LanguageUi = () => {
    const { language, setLanguage } = useLanguageStore();

    return (
        <MySelect
            options={options}
            defaultValue={language}
            onChange={(v)=>setLanguage(v as LANGUAGE)}
        />
    );
};