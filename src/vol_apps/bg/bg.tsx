import {BgUiCopyright} from "@/vol_apps/bg/bg_ui_copyright";
import {useBgLogic} from "@/vol_apps/bg/bg_logic";
import {Settings} from "@/vol_apps/settings/settings";

export function BgApp() {
    const { handlePrev, handleNext, handleDirChange, percent, fixedPending } =
        useBgLogic();
    return (
        <>
            <Settings handleDirChange = {handleDirChange}/>
            <BgUiCopyright handlePrev={handlePrev}
                           handleNext={handleNext}
                           percent={percent}
                           fixedPending={fixedPending}/>
        </>
    );
}