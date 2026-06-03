import {MyRadio} from "@/vol_apps/bg/bg_ui_settings";
import {useLanguageAtom} from "@/vol_apps/language/languageAtom.ts";
import {useSearchStyleAtom} from "@/vol_apps/search/searchStyleAtom.ts";

export const Setting_search = () => {
    const {visible, setVisible} = useSearchStyleAtom()
    const {t} = useLanguageAtom()

    const searchVisibleOptions = [
        {value: "true", label: t("Visible")},
        {value: "false", label: t("Invisible")}
    ]

    return (
        <div className={"flex flex-col gap-2.5 p-1 w-full"}>
            <MyRadio title={t("Visible")} options={searchVisibleOptions}
                     value={visible ? "true": "false"}
                     onValueChange={(value) => setVisible(value === "true")}
            />
        </div>
    )
}