import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {ChevronLeft, ChevronRight, CircleCheck} from "lucide-react";
import {cn} from "@/lib/utils";
import {getDateWithOffset} from "@/vol_apps/bg/bg_api.tsx";
import {useCallback} from "react";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {bgStore} from "@/vol_apps/bg/bg_atom.ts";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";

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

type Props = {
    handlePrev: () => void;
    handleNext: () => void;
    percent: number;
    fixedPending: boolean;
};

export const BgUiCopyright = (
    {
        handleNext, handlePrev,
        percent, fixedPending,
    }: Props) => {

    const {t} = useLanguage("bg");
    const { bgType } = useSignal(bgStore("bgType"));
    const { bgBingCopyright } = useSignal(bgStore("bgBingCopyright"));
    const { bgBingDate } = useSignal(bgStore("bgBingDate"));

    const disabledDate = useCallback(() => (
                getDateWithOffset(undefined, -2) === bgBingDate)
            || (getDateWithOffset(undefined, -1) === bgBingDate)
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
                                            disabled={fixedPending || disabledDate()}
                                            aria-label={"Next Wallpaper"}
                                        >
                                            {fixedPending
                                                ? percent === 100
                                                    ? <CircleCheck className={cn("text-foreground bg-transparent", TransitionColors)}/>
                                                    : <Spinner className={cn("text-sBlue bg-transparent", TransitionColors)}/>
                                                : <ChevronLeft
                                                    className={cn("text-foreground bg-transparent", disabledDate() && "opacity-0", TransitionColors,)}/>
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