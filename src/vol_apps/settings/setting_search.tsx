import {MyRadio} from "@/vol_apps/bg/bg_ui_settings";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {searchStore} from "@/vol_apps/search/search2.tsx";

export const Setting_search = () => {
    // const {visible, setVisible} = useSignal(...searchStyleConfig("visible"))
    const {visible, setVisible} = useSignal(searchStore("visible"))
    const {t} = useLanguage()

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