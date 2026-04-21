import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {cn} from "@/lib/utils";

const TransitionColors = "transition-colors duration-300 ease-in-out"

export const BgUiCopyright = (
    {bgType, bgBingCopyright, handleNext, handlePrev, nextIsPending, prevIsPending, t}: any
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
                        {bgBingCopyright
                            ? <p className={cn(
                            "px-3 py-2 rounded-l-sm",
                            "bg-transparent text-foreground",
                            "hover:bg-background",
                            "text-sm",
                            TransitionColors,
                        )}>{bgBingCopyright}</p>
                            : <p className={cn(
                                "px-2 py-2 rounded-l-sm",
                                "bg-transparent text-foreground",
                                "hover:bg-background",
                                "text-sm",
                            )}>{t("Fetching Bing wallpaper")}</p>
                        }
                        {/* 左箭头 */}
                        {bgBingCopyright
                            ? (<>
                                    {/* 左箭头 */}
                                    <Button
                                        variant="link"
                                        className={cn(
                                            "rounded-l-none rounded-r-sm",
                                            "bg-transparent text-foreground",
                                            "hover:bg-background",
                                            TransitionColors,
                                        )}
                                        onClick={handleNext}
                                        disabled={nextIsPending}
                                        aria-label={"Next Wallpaper"}
                                    >
                                        {nextIsPending ? (
                                            <Spinner className={cn(
                                                "text-sBlue bg-transparent", TransitionColors)}/>
                                        ) : (
                                            <ChevronLeft className={cn(
                                                "text-foreground bg-transparent", TransitionColors,
                                            )}/>
                                        )}
                                    </Button>
                                    {/* 右箭头 */}
                                    <Button
                                        variant="link"
                                        className={cn(
                                            "rounded-l-none rounded-r-sm",
                                            "bg-transparent text-foreground",
                                            "hover:bg-background",
                                            TransitionColors,
                                        )}
                                        onClick={handlePrev}
                                        disabled={prevIsPending}
                                        aria-label={"Prev Wallpaper"}
                                    >
                                        {prevIsPending ? (
                                            <Spinner className={cn(
                                                "text-sBlue bg-transparent", TransitionColors)}/>
                                        ) : (
                                            <ChevronRight className={cn(
                                                "text-foreground bg-transparent", TransitionColors,
                                            )}/>
                                        )}
                                    </Button>
                                </>
                            )
                            : <Button
                                variant="link"
                                className={cn(
                                    "rounded-l-none rounded-r-sm",
                                    "bg-transparent text-foreground",
                                    "hover:bg-background",
                                    TransitionColors,
                                )}
                                onClick={handlePrev}
                                disabled={true}
                                aria-label={"Wallpaper Pending"}
                            >
                                <Spinner className={cn("text-sBlue bg-transparent", TransitionColors)}/>
                            </Button>
                        }

                    </div>
                </div>
            ) : null
            }
        </div>
    );
};