import {useEffect, useState} from "react";
import {toast} from "sonner";
import {Forward, Music, Pause, Play, Repeat} from "lucide-react";
import {useAudioState} from "@/vol_apps/02_hooks/useAudioState";
import {cn} from "@/lib/utils";
import {useAcgmApi} from "@/vol_apps/acgm/useAcgm";
import {TransitionImage} from "@/vol_apps/01_components/TransitionImage";
import {Button} from "@/components/ui/button";
import {useFloatAnimation} from "@/vol_apps/02_hooks/useFloatAnimation";

const formatMMSS = (sec: number) => {
    if (Number.isNaN(sec)) return ""
    if (sec <= 0.5) return "";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
};

export const Acgm = () => {
    const [open , setOpen] = useState(false);
    const floatingStyle = useFloatAnimation({open, direction:"bottom", })

    const {songData, getSongData} = useAcgmApi()
    const {
        state, meta, currentTime,
        isPlaying,
        togglePlay, rePlay,
        autoPlay, setAutoPlay,
        audioRef
    } = useAudioState();

    const [repeat, setRepeat] = useState<boolean>(false);
    const audioUrl = songData?.link

    // 主按钮
    const handlePlay = async () => {
        if (!songData || state.connection === "failed") {
            await getSongData()
        } else {
            await togglePlay()
        }
    }

    const [skipError, setSkipError] = useState<boolean>(true);
    const SkipError = async () => {
        toast.error("音源错误, 自动切歌");
        await getSongData();
    }

    useEffect(() => {
        if (!skipError) return
        if (state.connection !== "failed") return
        const timer = setTimeout(SkipError, 1500);
        return () => clearTimeout(timer);
    }, [state.connection, skipError])

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio || !meta.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, x / rect.width));
        audio.currentTime = ratio * meta.duration;
    };

    const Cover =
        <div className={cn("group relative w-[200px] h-[200px] flex items-center justify-center")}>
            <div className={cn(
                "flex w-[190px] h-[190px] border border-sBlue",
                "animate-[spin_48s_linear_infinite] rounded-full overflow-hidden"
            )}
                 onClick={handlePlay}
                 style={{animationPlayState: isPlaying ? "running" : "paused"}}>
                <TransitionImage src={songData?.cover}/>
            </div>
            <div className={cn(
                "absolute inset-0",
                "w-[50%] h-[50%]",
                "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                "transition-opacity duration-300",
                isPlaying ? "opacity-0" : "opacity-30"
            )} onClick={handlePlay}>
                {isPlaying
                    ? <Pause strokeWidth={1.1} className={"w-full h-full text-sBlue fill-sBlue"}/>
                    : <Play strokeWidth={3.3} className={"w-full h-full text-sBlue fill-sBlue translate-x-[3%]"}/>
                }
            </div>
        </div>

    const Info =
        <div className={"h-[123px] w-full flex flex-col items-center justify-center"}>
            <p className={"pt-3 flex items-center justify-center text-foreground font-bold"}>
                {songData?.title || "\u00A0"}
            </p>
            <p className={"py-3 flex items-center justify-center text-foreground"}>{
                songData?.artist || "\u00A0"}
            </p>
        </div>

    const Buttons =
        <div className={cn("h-[60px] w-full flex items-center justify-center gap-px rounded-br-md overflow-hidden")}>
            <button className={cn(
                "group w-full h-full flex items-center justify-center",
                "bg-secondary text-sBlue border-none",
                "hover:bg-sBlue hover:text-white",
                "transition-colors duration-200 ease-in-out",
            )} onClick={() => setRepeat(!repeat)}>
                {repeat ? <Repeat strokeWidth={2.5} className={"scale-90"}/>
                    : <Repeat strokeWidth={1} className={"text-foreground/60 scale-90"}/>}
            </button>
            <button className={cn(
                "group w-full h-full flex items-center justify-center",
                "bg-secondary  border-none",
                "hover:bg-sBlue",
                "transition-colors duration-200 ease-in-out",
            )}
                    onClick={handlePlay}>
                {isPlaying
                    ? <Pause strokeWidth={0.5} className={
                    "text-sBlue fill-sBlue group-hover:text-white group-hover:fill-white scale-90"}/>
                    : <Play className={"text-sBlue fill-sBlue group-hover:text-white group-hover:fill-white scale-85"}/>}
            </button>
            <button className={cn(
                "w-full h-full flex items-center justify-center",
                "bg-secondary text-sBlue border-none",
                "hover:bg-sBlue hover:text-white",
                "transition-colors duration-200 ease-in-out",
            )} onClick={async ()=>{
                await togglePlay();
                await getSongData()
            }}>
                {/*{repeat ? "单曲循环" : "自动切歌"}*/}
                {<Forward strokeWidth={3} />}
            </button>
        </div>

    const Duration =
        <div className={cn(
            "absolute bottom-0 w-full h-[16px] pointer-events-none",
            "items-center opacity-0 group-hover:opacity-100",
            "flex justify-between px-1 font-semibold text-foreground")}>
            <p>{formatMMSS(currentTime)}</p>
            <p>{formatMMSS(meta.duration)}</p>
        </div>

    const ProgressBar =
        <div className={cn("group h-[16px] w-full relative bg-secondary")}
             onClick={handleSeek}>
            <div className={"absolute inset-y-0 left-0 transition-[width] duration-1600 ease-in-out"}
                 style={{
                     width: `${meta.duration ? (meta.buffered / meta.duration) * 100 : 0}%`,
                     backgroundColor: "rgba(50, 150, 250, 0.35)"
                 }}/>
            <div className={"absolute inset-y-0 left-0 bg-sBlue transition-[width] duration-200 ease-in-out"}
                 style={{width: `${meta.duration ? (currentTime / meta.duration) * 100 : 0}%`}}/>

            {Duration}
        </div>

    const onEnded = async () => {
        if (repeat) await rePlay()
        else await getSongData()
    }

    return (
        <>
            <Button onClick={()=>setOpen(!open)}
                    className={cn(isPlaying
                        ? "bg-sBlue border-sBlue text-white hover:bg-sBlue hover:text-white"
                        : "",
                        "transition-colors duration-200 ease-in-out",
                    )}
                variant={"outline"} size={"icon"}>
                <Music className={cn(isPlaying && "animate-[bounce_1.5s_linear_infinite] scale-110 translate-y-[2.5px]",
                    "transition-[scale, transform] duration-200 ease-in-out",
                    )}
                />
            </Button>
            <div className={"fixed top-[52px] left-2 w-fit h-fit z-40"} style={floatingStyle}>
                {/* 主体 */}
                <div className={cn("relative flex flex-row w-fit h-fit rounded-md bg-popover shadow")}>
                    {Cover}
                    <div className={"w-[323px] h-[200px] relative"}>
                        {Info}
                        {ProgressBar}
                        <div className={"h-px w-full"}></div>
                        {Buttons}
                    </div>
                </div>
                {/* 调试面板 */}
                <div className={cn(
                    "hidden invisible",
                    "absolute bottom-0 right-0 translate-x-full w-fit bg-background text-foreground")}>
                    <audio onEnded={onEnded} ref={audioRef} src={audioUrl} controls={true}/>
                    <div><span className={"font-semibold"}>connection:</span> {state.connection}</div>
                    <div><span className={"font-semibold"}>data:</span> {state.data}</div>
                    <div><span className={"font-semibold"}>playback:</span> {state.playback}</div>
                    <label className={"w-fit flex items-center justify-center gap-2"}>
                        坏链接时，自动切歌
                        <input type={"checkbox"} className={"scale-130"} checked={skipError}
                               onChange={(e) => setSkipError(e.target.checked)}/>
                    </label>
                    <label className={"w-fit flex items-center justify-center gap-2"}>
                        缓冲就绪后，自动播放
                        <input type={"checkbox"} className={"scale-130"} checked={autoPlay}
                               onChange={(e) => setAutoPlay(e.target.checked)}/>
                    </label>
                </div>
            </div>
        </>


    );

};