import {useRef, useState, useCallback, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {toast} from "sonner";
import {Pause, Play, SkipBack, SkipForward} from "lucide-react";
import {useTopClick} from "@/vol_apps/tanStackQuery/Api_RadioBrowser";
import {useRadioStore} from "@/vol_apps/radio/radio_store";
import {defaultIconBase64} from "@/vol_apps/tile/tile_store_types";

export const RadioDemo = () => {

    const limit = 100;

    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const {
        radioUrl,
        radioFavicon,
        setRadioUrl,
        setRadioFavicon
    } = useRadioStore();

    const {TopClickJson, isPending, JsonListLenth} = useTopClick(index, 0, limit);

    const length = JsonListLenth ?? 0;

    const play = useCallback(async () => {
        try {
            await audioRef.current?.play();
        } catch (e) {
            toast.error("network error");
        }
    }, []);

    const pause = useCallback(() => {
        audioRef.current?.pause();
    }, []);

    const toggle = useCallback(() => {
        playing ? pause() : play();
    }, [playing, play, pause]);

    const switchStation = useCallback((nextIndex: number) => {
        setIndex(nextIndex);
    }, []);

    useEffect(() => {
        if (!TopClickJson?.url) return;

        const audio = audioRef.current;
        if (!audio) return;

        // 停止
        audio.pause();
        setPlaying(false);

        // 切源
        audio.src = TopClickJson.url;
        audio.load();

        // store 同步
        setRadioUrl(TopClickJson.url);
        setRadioFavicon(TopClickJson.favicon || defaultIconBase64);

    }, [index]);

    const [imgError, setImgError] = useState(false);

    return (
        <div className="flex flex-col p-0 gap-0 w-fit items-center">
            <audio
                className="w-71"
                ref={audioRef}
                src={radioUrl || undefined}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                controls={false}
            />
            <div className="flex gap-2 px-2 items-center">
                <img
                    className={cn("border animate-[spin_24s_linear_infinite]")}
                    src={imgError ? defaultIconBase64 : radioFavicon}
                    onError={() => setImgError(true)}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        animationPlayState: playing ? "running" : "paused",
                    }}
                    alt="radio favicon"
                />
                <Button
                    variant="outline"
                    className="w-18"
                    onClick={() => {
                        if (length === 0) return;
                        switchStation((index - 1 + length) % length)
                    }}
                >
                    <SkipBack/>
                </Button>
                <Button
                    variant="outline"
                    className="w-18"
                    onClick={toggle}
                    disabled={isPending}
                >
                    {playing ? <Pause/> : <Play/>}
                </Button>
                <Button
                    variant="outline"
                    className="w-18"
                    onClick={() => {
                        if (length === 0) return;
                        switchStation((index + 1) % length);
                    }}
                >
                    <SkipForward/>
                </Button>
        </div>
        </div>
    );
}