import {MyRadio} from "@/vol_apps/bg/bg_ui_settings";
import {useLanguageStore} from "@/vol_apps/language/language_store";
import {useTileStore} from "@/vol_apps/tile/tile_store";

export const Setting_tiles = () => {
    const {tilesVisible, setTilesVisible} = useTileStore()
    const {t} = useLanguageStore()

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