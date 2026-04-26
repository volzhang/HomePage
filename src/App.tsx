import {BgApp} from "@/vol_apps/bg/bg";
import {CmOpen} from "@/vol_apps/cm/cm_open";
import {DndFile} from "@/vol_apps/dndFile/dndFile";
import {Theme} from "@/vol_apps/theme/theme";
import {ToasterUi} from "@/vol_apps/toaster/toaster_ui";
import {Version} from "@/vol_apps/version/version";
import {Cm} from "@/vol_apps/cm/cm";
import {SearchBar} from "@/vol_apps/search/search";
import {Menu} from "@/vol_apps/menu/menu_legacy";
import {BingWallpaperArchiveProvider} from "./vol_apps/tanStackQuery/Api_BingWallpaper";
import {LanguageUi} from "@/vol_apps/language/language_ui";
import {Tile_app} from "./vol_apps/tile/Tile_app";

export const App = () => {
    return (
        <>
            <ToasterUi/>
            <Cm/>
            <div className={"flex flex-row gap-2 px-2 pt-2"}>
                <Menu/>
                <LanguageUi/>
                <Theme/>
                <CmOpen/>
            </div>
            <div className={"absolute top-2 right-2"}>
                <Version/>
            </div>
            <div className={"flex mt-30 mb-15"}>
                <SearchBar/>
            </div>
            <Tile_app/>
            <DndFile/>
            <BingWallpaperArchiveProvider>
                <BgApp/>
            </BingWallpaperArchiveProvider>
        </>);
};
