import {useRef, useEffect, useState} from "react";
import {useTopClick} from "@/vol_apps/tanStackQuery/Api_RadioBrowser";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {defaultIconBase64} from "@/vol_apps/tile/tile_store_types";
import {toast} from "sonner";
import {
    // Heart,
    Pause, Play, SkipBack, SkipForward} from "lucide-react";

export default function RadioDemo() {

    const limit = 100
    const [index, setIndex] = useState<number>(0)
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const shouldAutoPlay = useRef(false);
    // 错误计数 ref，避免陷入死循环
    const consecutiveErrors = useRef(0);

    const {TopClickJson, isPending, error} = useTopClick(index, 0, limit);

    const toggle = async () => {
        const audio = audioRef.current;
        if (!audio || !TopClickJson?.url || isPending) return;

        if (playing) {
            audio.pause();
            setPlaying(false);
            shouldAutoPlay.current = false;
        } else {
            try {
                await audio.play();
                setPlaying(true);
                shouldAutoPlay.current = true;
                consecutiveErrors.current = 0; // 成功则清零
            } catch (e) {
                console.log("手动播放失败", e);
                toast.error("播放失败，请稍后再试");
            }
        }
    };

    // 电台切换处理
    useEffect(() => {
        const audio = audioRef.current;
        // 数据未就绪时不做任何事
        if (!audio || !TopClickJson?.url || isPending) return;

        audio.pause();
        audio.load();

        if (shouldAutoPlay.current) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setPlaying(true);
                        consecutiveErrors.current = 0;
                    })
                    .catch((err) => {
                        // 自动播放被浏览器阻止 → 维持暂停状态，不切歌
                        if (err.name === "NotAllowedError") {
                            console.warn("自动播放被阻止，请手动点击播放");
                            setPlaying(false);
                            return;
                        }
                        // 其他错误 → 检查是否为永久性媒体错误
                        const audioError = audio.error;
                        const isFatalError =
                            audioError?.code === MediaError.MEDIA_ERR_DECODE ||
                            audioError?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED;

                        if (isFatalError) {
                            console.error("音频不可用，自动切换下一首", err);
                            toast.error("音频不可用，自动切换下一首");
                            consecutiveErrors.current += 1;
                            if (consecutiveErrors.current >= 3) {
                                toast.error("连续多个电台不可用，请稍后重试");
                                consecutiveErrors.current = 0;
                                setPlaying(false);
                            } else {
                                setTimeout(() => {
                                    setIndex(prev => (prev + 1) % limit);
                                }, 300);
                            }
                        } else {
                            // 网络等临时错误 → 不切歌，提示用户
                            console.error("播放异常，请检查网络", err);
                            toast.error("网络异常，请稍后点击播放");
                        }
                        setPlaying(false);
                    });
            }
        } else {
            setPlaying(false);
        }
    }, [TopClickJson?.url, isPending]);

    const [imgError, setImgError] = useState(false);
    // 当电台切换时重置错误标记
    useEffect(() => {
        setImgError(false);
    }, [TopClickJson?.stationuuid]); // 或 index

    // 查询发生错误时的处理（整个列表请求失败）
    useEffect(() => {
        if (error) {
            toast.error("获取电台列表失败，请刷新");
        }
    }, [error]);

    // const formatText = (text?: string) => text?.replace(/,/g, " ");

    return (
        <div>
            {/* audio */}
            <audio
                ref={audioRef}
                src={TopClickJson?.url}
                preload="none"
            />
            <div className={"flex flex-row gap-2 px-2"}>
                <img
                    className={cn("border animate-[spin_24s_linear_infinite]")}
                    alt="radio favicon"
                    src={imgError ? defaultIconBase64 : (TopClickJson?.favicon || defaultIconBase64)}
                    onError={() => setImgError(true)}
                    style={{
                        width: `36px`,
                        height: `36px`,
                        borderRadius: `50%`,
                        animationPlayState: playing ? "running" : "paused",
                    }}>
                </img>
                {/* 播放器 */}
                <Button variant={"outline"} className={cn("w-18")}
                        onClick={() => setIndex((index - 1 + limit) % limit)}>
                    <SkipBack/>
                </Button>
                <Button variant={"outline"} className={cn("w-18")}
                        onClick={toggle}>
                    {playing ? <Pause/> : <Play/>}
                </Button>
                <Button variant={"outline"} className={cn("w-18")}
                        onClick={() => setIndex((index + 1) % limit)}>
                    <SkipForward/>
                </Button>

                {/* META */}
                {/*<p className={cn("text-xl font-bold wrap-break-word text-sBlue")}>{TopClickJson?.name}</p>*/}
                {/*<p className={"flex flex-row gap-2"}>*/}
                {/*    <Heart className={""}/>*/}
                {/*    {TopClickJson?.clickcount}*/}
                {/*</p>*/}
            </div>
            {/*<div className="w-160 m-10 h-fit p-4 rounded-lg shadow-lg bg-background text-foreground">*/}
            {/*    /!* 封面 *!/*/}
            {/*    <div className="flex w-full h-fit gap-4">*/}
            {/*        <div className="flex-1 p-2">*/}
            {/*            <p className={cn("text-xl font-bold wrap-break-word text-sBlue")}>{TopClickJson?.name}</p>*/}
            {/*            <p className={"flex flex-row gap-2"}>*/}
            {/*                <Heart className={""}/>*/}
            {/*                {TopClickJson?.clickcount}*/}
            {/*            </p>*/}
            {/*            <p className={"text-sm opacity-20 break-all"} > {TopClickJson?.stationuuid} </p>*/}
            {/*            <p className={"text-md wrap-break-word"}>{formatText(TopClickJson?.language)}</p>*/}
            {/*            <p className={"text-md opacity-90 wrap-break-word"}>{formatText(TopClickJson?.tags)}</p>*/}
            {/*            <p className={"text-sm opacity-20 break-all"}>{TopClickJson?.url}</p>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    );
}