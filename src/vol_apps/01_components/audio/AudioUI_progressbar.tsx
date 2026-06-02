import {cn} from "@/lib/utils";
import {formatMMSS} from "@/vol_apps/04_utils/format/formatToMMSS";

export const Duration = (
    {
        duration,
        currentTime,
    }:{
        duration:number;
        currentTime:number;
    }
) =>
    <div className={cn(
        "absolute bottom-0 w-full h-[16px] pointer-events-none",
        "items-center opacity-0 group-hover:opacity-100",
        "flex justify-between px-[2px] font-semibold text-foreground",
        "transition duration-250 ease-in-out",
    )}>
        <p>{formatMMSS(currentTime)}</p>
        <p>{formatMMSS(duration)}</p>
    </div>

export const AudioUI_progressbar = (
    {
        meta,
        onSeek,

        bgColor,
        bufferedColor,
        playedColor,
        size,
        className,
        children,
    }: {
        bgColor?: string;
        bufferedColor?: string;
        playedColor?: string;

        meta: {
            duration: number;
            bufferedDuration: number;
            currentTime: number;
        }

        size?: { width: number, height: number };
        onSeek?: (e: React.MouseEvent<HTMLDivElement>) => void;
        className?: string;
        children?: React.ReactNode;
    }
) => {

    const {duration, bufferedDuration, currentTime, } = meta
    return (
        <>
            {/* base */}
            <div className={cn("relative bg-secondary overflow-hidden h-[16px] w-[600px]", className)} onClick={onSeek}
                 style={{
                     backgroundColor: bgColor,
                     width: size && `${size.width}px`,
                     height: size && `${size.height}px`,
                 }}
            >
                {/* buffered */}
                <div className={"absolute inset-y-0 left-0 transition-[width] duration-[1500ms] ease-in-out"}
                     style={{
                         backgroundColor: bufferedColor ? bufferedColor : "rgba(50, 150, 250, 0.35)",
                         width: `${duration ? (bufferedDuration / duration) * 100 : 0}%`,
                     }}/>
                {/* played */}
                <div className={"absolute inset-y-0 left-0 bg-sBlue transition-[width] duration-[250ms] ease-in-out"}
                     style={{
                         backgroundColor: playedColor,
                         width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                     }}/>

                {children}
            </div>
        </>
    )
}
