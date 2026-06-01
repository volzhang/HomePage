import {MyRadio} from "@/vol_apps/bg/bg_ui_settings";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {useLanguageAtom} from "@/vol_apps/language/languageAtom.ts";

export const Setting_tiles = () => {
    const {tilesVisible, setTilesVisible} = useTileStore()
    const {t} = useLanguageAtom()

    const tilesVisibleOptions = [
        {value: "true", label: t("Visible")},
        {value: "false", label: t("Invisible")}
    ]

    return (
        <div className={"flex flex-col gap-2.5 p-1 w-full"}>
            <MyRadio title={t("Visible")} options={tilesVisibleOptions}
                     value={tilesVisible ? "true": "false"}
                     onValueChange={(value) => setTilesVisible(value === "true")}
            />
        </div>
    )
}