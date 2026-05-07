import {BgUiCopyright} from "@/vol_apps/bg/bg_ui_copyright";
import {useBgLogic} from "@/vol_apps/bg/bg_logic";
import {BingWallpaperArchiveProvider} from "@/vol_apps/tanStackQuery/Api_BingWallpaper";
import {BgUiSettings} from "@/vol_apps/bg/bg_ui_settings";

export function BgApp() {
    const logic = useBgLogic()
    return (
        <BingWallpaperArchiveProvider>
            <BgUiSettings {...logic}/>
            <BgUiCopyright {...logic}/>
        </BingWallpaperArchiveProvider>
    );
}