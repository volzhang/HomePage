
import {TransitionImage} from "@/vol_apps/01_components/TransitionImage";
import {cn} from "@/lib/utils";
import {Pause, Play} from "lucide-react";
import type {ComponentPropsWithoutRef} from "react";


export const AudioUI_Cover = (
    {
        onClick,
        src,
        isPlaying,
        className,
        imageClassName,
    }: {
        src?: string | undefined
        isPlaying?: boolean
        className?: string
        onClick?: () => void
        imageClassName?: string
    } & ComponentPropsWithoutRef<'div'>
) => {

    return (
        <div className={cn("group relative w-[200px] h-[200px] flex items-center justify-center", className)}>
            <TransitionImage
                style={{animationPlayState: isPlaying ? "running" : "paused"}}
                src={src} alt={"Cover"}
                onClick={onClick}
                className={cn("animate-[spin_60s_linear_infinite]",
                    "w-[190px] h-[190px] rounded-full overflow-hidden",
                    "border border-sBlue", imageClassName)}
            />
            <div className={cn(
                "absolute inset-0",
                "w-[50%] h-[50%]",
                "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                "transition-opacity duration-250",
                "pointer-events-none",
                isPlaying ? "opacity-0" : "opacity-20"
            )}>
                {isPlaying
                    ? <Pause strokeWidth={1.1} className={"w-full h-full text-sBlue fill-sBlue opacity-0"}/>
                    : <Play strokeWidth={3.3} className={"w-full h-full text-sBlue fill-sBlue translate-x-[3%]"}/>
                }
            </div>
        </div>
    )
}