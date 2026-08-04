import {BgApp} from "@/vol_apps/bg/bg";
import {CmOpen} from "@/vol_apps/cm/cm_open";
import {DndFile} from "@/vol_apps/dndFile/dndFile";
import {Theme} from "@/vol_apps/theme/theme";
import {ToasterUi} from "@/vol_apps/toaster/toaster_ui";
import {Version} from "@/vol_apps/version/version";
import {Cm} from "@/vol_apps/cm/cm";
import {Menu} from "@/vol_apps/menu/menu_legacy";
import {Tile_app} from "@/vol_apps/tile/Tile_app";
import {Language} from "@/vol_apps/language/language";
import "@/vol_apps/04_persist_atoms/migration.ts";
import {Backup} from "@/vol_apps/backupDirectory/backup.tsx";
import {SearchBar} from "@/vol_apps/search/search.tsx";

export const App = () => {
    // useLogEventPath('click')
    return (
        <>
            <ToasterUi/>
            <Cm/>
            <div className={"flex flex-row gap-2 pl-2 pt-2 w-fit"}>
                <Menu/>
                <Theme/>
                <CmOpen/>
                <Language/>
                <Backup/>
            </div>
            <div className={"fixed top-2 right-2"}>
                <Version/>
            </div>
            {/*<SearchBar/>*/}
            <div className={"mt-[120px] mb-[50px] w-full mx-auto"}>
                <SearchBar/>
            </div>
            <Tile_app/>
            <DndFile/>
            <BgApp/>
        </>);
};
