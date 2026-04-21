import {BgUiSetting} from "@/vol_apps/bg/bg_ui_setting";
import {BgUiCopyright} from "@/vol_apps/bg/bg_ui_copyright";
import {useBgLogic} from "@/vol_apps/bg/bg_logic";

export function BgApp() {
    const logic = useBgLogic()
    return (
        <>
            <BgUiSetting {...logic}/>
            <BgUiCopyright {...logic}/>
        </>
    );
}