import {MyRadio} from "@/vol_apps/bg/bg_ui_settings";
import {useLanguageStore} from "@/vol_apps/language/language_store";
import {useTagStyleStore} from "@/vol_apps/tag/tag_style_store";

export const Setting_tag = () => {
    const {visible, setVisible} = useTagStyleStore()
    const {t} = useLanguageStore()

    const tagVisibleOptions = [
        {value: "true", label: t("Visible")},
        {value: "false", label: t("Invisible")}
    ]

    return (
        <div className={"flex flex-col gap-2.5 p-1 w-full"}>
            <MyRadio title={t("Visible")} options={tagVisibleOptions}
                     value={visible ? "true": "false"}
                     onValueChange={(value) => setVisible(value === "true")}
            />
        </div>
    )
}