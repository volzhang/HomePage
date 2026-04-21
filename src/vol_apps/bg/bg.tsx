import {BgUiSetting} from "@/vol_apps/bg/bg_ui_setting";
import {BgUiCopyright} from "@/vol_apps/bg/bg_ui_copyright";
import {useBgLogic} from "@/vol_apps/bg/bg_logic";
import {BingWallpaperArchiveProvider} from "@/vol_apps/tanStackQuery/Api_BingWallpaper";

export function BgApp() {
    const logic = useBgLogic()
    return (
        <BingWallpaperArchiveProvider>
            <BgUiSetting {...logic}/>
            <BgUiCopyright {...logic}/>
        </BingWallpaperArchiveProvider>
    );
}