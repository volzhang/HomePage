import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {ChevronRight} from "lucide-react";
import type {BgType} from "@/vol_apps/bg/bg_store";
import {cn} from "@/lib/utils";

const TransitionColors = "transition-colors duration-300 ease-in-out"

export const BgUiCopyright = (
    {bgType, copyright, handleNextBing, copyrightIsLoading,}: {
        bgType: BgType,
        copyright: string,
        handleNextBing: () => void,
        copyrightIsLoading: boolean,
    }
) => {
    return (
        <div className={"z-0"}>
            {bgType === "bing" ? (
                <div className="fixed bottom-2 right-2">
                    <div className={cn("flex flex-row justify-center items-center w-fit gap-0" +
                        "bg-background/20",
                        "hover:bg-background/80",
                        "group",
                        "rounded-sm overflow-hidden",
                        TransitionColors,
                    )}>
                        {copyright && <p className={cn(
                            "px-4 py-2 rounded-l-sm",
                            "bg-transparent text-foreground",
                            "hover:bg-background",
                            "text-sm",
                            TransitionColors,
                        )}>{copyright}</p>}
                        <Button
                            variant="link"
                            className={cn(
                                "rounded-l-none rounded-r-sm",
                                "bg-transparent text-foreground",
                                "hover:bg-background",
                                TransitionColors,
                            )}
                            onClick={handleNextBing}
                            disabled={copyrightIsLoading}
                            aria-label={"Next Wallpaper"}
                        >
                            {copyrightIsLoading ? (
                                <Spinner className={cn(
                                    "text-sBlue bg-transparent", TransitionColors)}/>
                            ) : (
                                <ChevronRight className={cn(
                                    "text-foreground bg-transparent", TransitionColors,
                                )}/>
                            )}
                        </Button>
                    </div>
                </div>
            ) : null
            }
        </div>
    );
};