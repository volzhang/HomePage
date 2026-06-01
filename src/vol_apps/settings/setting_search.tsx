import {MyRadio} from "@/vol_apps/bg/bg_ui_settings";

import {useSearchStyleStore} from "@/vol_apps/search/search_style_store";
import {useLanguageAtom} from "@/vol_apps/language/languageAtom.ts";

export const Setting_search = () => {
    const {visible, setVisible} = useSearchStyleStore()
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