import {BgApp} from "@/vol_apps/bg/bg";
import {CmOpen} from "@/vol_apps/cm/cm_open";
import {DndFile} from "@/vol_apps/dndFile/dndFile";
import {I18nUi} from "@/vol_apps/i8n/i18n_ui";
import {Menu} from "@/vol_apps/menu/menu";
import {SearchComponent} from "@/vol_apps/search/search";
import {Theme} from "@/vol_apps/theme/theme";
import {TileApp} from "@/vol_apps/tile/tile_app";
import {ToasterUi} from "@/vol_apps/toaster/toaster_ui";
import {Version} from "@/vol_apps/version/version";
import {Cm} from "@/vol_apps/cm/cm";
import {GlobalContextMenu} from "@/vol_apps/cMenu/globalContextMenu.js";

export const App = () => {
    return (
        <>

            <ToasterUi/>
            <Cm/>
            <GlobalContextMenu>
                <div className={"flex gap-2 p-2"}>
                    <Menu/>
                    <I18nUi/>
                    <Theme/>
                    <CmOpen/>
                </div>
                <div className={"absolute top-2 right-2"}>
                    <div className={"flex gap-2"}>
                        <Version/>
                    </div>
                </div>
                <SearchComponent/>
                <TileApp/>
                <DndFile/>
            </GlobalContextMenu>
            <BgApp/>
            {/*	推荐BG放到最下面（这样不用设置z-index）*/}
        </>);
};
