import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {ChevronLeft, ChevronRight, CircleCheck} from "lucide-react";
import {cn} from "@/lib/utils";
import type {BgLogic} from "@/vol_apps/bg/bg_logic";
import {getDateWithOffset} from "@/vol_apps/bg/bg_api.tsx";
import {useCallback} from "react";

const TransitionColors = "transition-all duration-300 ease-in-out"

const IsPending = ({percent}: any) => {
    return (
        <>
            <Button
                variant="link"
                className={cn(
                    "rounded-l-none rounded-r-sm",
                    "bg-transparent text-foreground",
                    "hover:bg-background",
                    TransitionColors,
                )}
                disabled={true}
                aria-label={"Next Wallpaper"}
            >
                {percent === 100
                    ? <CircleCheck className={cn("text-foreground bg-transparent", TransitionColors)}/>
                    : <Spinner className={cn("text-sBlue bg-transparent", TransitionColors)}/>}
            </Button>
            <Button
                variant="link"
                className={cn(
                    "rounded-l-none rounded-r-sm",
                    "bg-transparent text-foreground",
                    "hover:bg-background",
                    TransitionColors,
                )}
                disabled={true}
                aria-label={"Prev Wallpaper"}
            >
                <p className={"text-foreground bg-transparent"}>{percent.toFixed(0) + "%"}</p>
            </Button>
        </>
    )
}

export const BgUiCopyright = (
    {
        bgType, bgBingCopyright, bgBingDate, handleNext, handlePrev,
        // isPending,
        percent, t, fixedPending,
    }: BgLogic) => {

    const afterYestoday = useCallback(() => (
                getDateWithOffset(undefined, -1) === bgBingDate)
            || (getDateWithOffset() === bgBingDate)
        , [bgBingDate])

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
                            // 有缓存
                            ? <p className={cn(
                                "px-3 py-2 rounded-l-sm",
                                "bg-transparent text-foreground/80",
                                "hover:bg-background",
                                "hover:text-foreground",
                                "text-sm",
                                TransitionColors,
                            )}>{bgBingCopyright}</p>
                            // 缓存为空时
                            : <p className={cn(
                                "px-2 py-2 rounded-l-sm",
                                "bg-transparent text-foreground/80",
                                "hover:bg-background",
                                "hover:text-foreground",
                                "text-sm",
                            )}>{t("Fetching Bing wallpaper")}</p>
                        }
                        {/* 左箭头 */}
                        {bgBingCopyright
                            // 有缓存时
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
                                            disabled={fixedPending || afterYestoday()}
                                            aria-label={"Next Wallpaper"}
                                        >
                                            {fixedPending
                                                ? percent === 100
                                                    ? <CircleCheck className={cn("text-foreground bg-transparent", TransitionColors)}/>
                                                    : <Spinner className={cn("text-sBlue bg-transparent", TransitionColors)}/>
                                                : <ChevronLeft
                                                    className={cn("text-foreground bg-transparent", afterYestoday() && "opacity-0", TransitionColors,)}/>
                                            }
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
                                            disabled={fixedPending}
                                            aria-label={"Prev Wallpaper"}
                                        >
                                            {fixedPending
                                                ? <p className={"text-foreground bg-transparent"}>{percent.toFixed(0) + "%"}</p>
                                                : <ChevronRight className={cn("text-foreground bg-transparent", TransitionColors,)}/>
                                            }
                                        </Button>
                                </>
                            )
                            : <IsPending percent={percent}/>
                        }
                    </div>
                </div>
            ) : null
            }
        </div>
    );
};