import {useEffect, useState} from "react";
import {toast} from "sonner";
import {BoomBox, FileMusic, Folder, Forward, Minus, Music, Pause, Play, Repeat, X} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {useFloatAnimation} from "@/vol_apps/02_hooks/useFloatAnimation";

import {FetchMonitor} from "@/vol_apps/01_components/FetchMonitor";
import {useMyList} from "@/vol_apps/acgm/useAcgmList";
import {AudioPlayer} from "@/vol_apps/01_components/audio/AudioPlayer";
import {useAudioContext} from "@/vol_apps/01_components/audio/AudioContext";
import {AudioUI_progressbar, Duration} from "@/vol_apps/01_components/audio/AudioUI_progressbar";
import {AudioUI_Cover} from "@/vol_apps/01_components/audio/AudioUI_Cover";


export const Acgm = () => {
    const [open, setOpen] = useState(false);
    const floatingStyle = useFloatAnimation({open, direction: "bottom",})

    const {songData, getNextSongData: getSongData} = useMyList()

    const {
        state, meta, currentTime,
        isPlaying,
        togglePlay, rePlay, tryPlay,
        audioRef,
        setSrc,
    } = useAudioContext();

    const [repeat, setRepeat] = useState<boolean>(false);

    const [urlType, setUrlType] = useState<"List" | "File" | "Folder">("List")
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    // 使用默认播放菜单
    useEffect(() => {
        if (!songData?.link) return
        if (urlType !== "List") return
        setAudioUrl(songData?.link)
    }, [songData?.link, urlType]);

    // 同步 AudioState
    useEffect(() => {
        if (!audioUrl) return
        setSrc(audioUrl)
    }, [audioUrl]);

    // 主按钮
    const handlePlay = async () => {
        if (!songData || state.connection === "failed") {
            getSongData()
        } else {
            await togglePlay()
        }
    }

    const [skipError, setSkipError] = useState<boolean>(true);
    const SkipError = async () => {
        toast.error("音源错误, 自动切歌");
        getSongData();
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

    const Cover = <AudioUI_Cover src={songData?.cover} isPlaying={isPlaying} onClick={handlePlay}/>

    const Info =
        <div className={"h-[123px] w-full flex flex-col items-center justify-center pointer-events-none"}>
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
                "group w-full h-full flex items-center justify-center outline-none",
                "bg-secondary text-sBlue border-none",
                "hover:bg-sBlue hover:text-white",
                "transition-colors duration-200 ease-in-out",
            )} onClick={() => setRepeat(!repeat)}>
                {repeat ? <Repeat strokeWidth={2.5} className={"scale-90"}/>
                    : <Repeat strokeWidth={1} className={"text-foreground/60 scale-90"}/>}
            </button>
            <button className={cn(
                "group w-full h-full flex items-center justify-center outline-none",
                "bg-secondary  border-none",
                "hover:bg-sBlue",
                "transition-colors duration-200 ease-in-out",
            )}
                    onClick={handlePlay}>
                {isPlaying
                    ? <Pause strokeWidth={0.5} className={
                        "text-sBlue fill-sBlue group-hover:text-white group-hover:fill-white scale-90"}/>
                    :
                    <Play className={"text-sBlue fill-sBlue group-hover:text-white group-hover:fill-white scale-85"}/>}
            </button>
            <button className={cn(
                "w-full h-full flex items-center justify-center outline-none",
                "bg-secondary text-sBlue border-none",
                "hover:bg-sBlue hover:text-white",
                "transition-colors duration-200 ease-in-out",
            )} onClick={async () => {
                await togglePlay();
                getSongData()
            }}>
                {<Forward strokeWidth={3}/>}
            </button>
        </div>

    const ProgressBar =
        <AudioUI_progressbar
            meta={{
                duration: meta.duration,
                bufferedDuration: meta.buffered,
                currentTime,
            }} onSeek={handleSeek} className={"w-full group"}>
            <Duration duration={meta.duration} currentTime={currentTime}/>
        </AudioUI_progressbar>

    const onEnded = async () => {
        if (repeat) await rePlay()
        else getSongData()
    }

    const onChooseFile = async () => {
        // @ts-ignore
        const [fileHandle] = await window.showOpenFilePicker(
            {types: [{description: "音频文件",
                accept: {
                    "audio/mpeg": [".mp3"],
                    "audio/wav": [".wav"],
                    "audio/ogg": [".ogg"],
                    "audio/x-m4a": [".m4a"],
                    "audio/aac": [".aac"],
                    "audio/flac": [".flac"],
                },
            },], multiple: false, excludeAcceptAllOption: true,
        });
        const file = await fileHandle.getFile();
        setUrlType("File")
        setAudioUrl(URL.createObjectURL(file))
    }

    return (
        <>
            <Button onClick={() => setOpen(!open)}
                    className={cn(isPlaying && "bg-sBlue border-sBlue  hover:bg-sBlue text-white hover:text-white",
                        "transition-colors duration-200 ease-in-out",
                    )}
                    variant={"outline"} size={"icon"}>
                <Music
                    className={cn(isPlaying && "animate-[bounce_1.5s_linear_infinite] translate-y-[2.5px] scale-110 dark:text-sBlue",
                        "transition-[scale, transform] duration-200 ease-in-out",
                    )}
                />
            </Button>

            <div className={"fixed top-[52px] left-2 w-fit h-fit z-40"} style={floatingStyle}>
                {/* 主体 */}
                <div className={cn("relative flex flex-row w-fit h-fit rounded-md bg-popover shadow")}>
                    {Cover}
                    <div className={"w-[323px] h-[200px] relative"}>
                        <div className={"absolute top-0 left-0"} onClick={onChooseFile}>
                            <FileMusic strokeWidth={2}
                                       className={cn((urlType == "File") && "text-sBlue",
                                "translate-y-[15%]  scale-y-72 scale-x-90")}/>
                        </div>
                        <div className={"absolute top-0 left-0 translate-x-[115%] "}>
                            <Folder strokeWidth={2}
                                    className={cn((urlType == "Folder") && "text-sBlue",
                                        "translate-y-[17%]  scale-y-82 scale-x-80")}/>
                        </div>
                        <div className={"absolute top-0 left-0 translate-x-[233%] "}
                             onClick={() => setUrlType("List")}>
                            <BoomBox strokeWidth={2} className={cn((urlType == "List") && "text-sBlue",
                                         "translate-y-[14%]  scale-y-82 scale-x-80",
                                     )}/>
                        </div>

                        <div className={"absolute top-0 right-0 rounded-tr-md -translate-x-[95%]"}
                             onClick={async () => {
                                 await tryPlay(false);
                                 setOpen(false)
                             }}>
                            <X strokeWidth={2.5} className={"translate-y-[9%] text-sBlue scale-88"}/>
                        </div>
                        <div className={"absolute top-0 right-0 rounded-tr-md"} onClick={() => setOpen(false)}>
                            <Minus strokeWidth={3} className={"translate-y-[28%] text-sBlue scale-88"}/>
                        </div>
                        {Info}
                        {ProgressBar}
                        <div className={"h-px w-full"}></div>
                        {Buttons}
                    </div>
                </div>
                {/* 调试 */}
                <div className={cn(
                    "hidden invisible",
                    "absolute bottom-0 left-0",
                    "translate-y-full w-fit bg-background text-foreground h-fit overscroll-y-auto")}>
                    <AudioPlayer onEnded={onEnded}>
                        <label className={"w-fit flex items-center justify-center gap-2"}>
                            坏链自动切歌
                            <input type={"checkbox"} className={"scale-130"} checked={skipError}
                                   onChange={(e) => setSkipError(e.target.checked)}/>
                        </label>
                    </AudioPlayer>
                    <FetchMonitor url={songData?.cover}/>
                </div>
            </div>
        </>
    );

};