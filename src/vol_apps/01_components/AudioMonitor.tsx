import {useEffect, useRef, useState} from "react";
import {useAudioState} from "@/vol_apps/02_hooks/audio/useAudioState";
import {cn} from "@/lib/utils";

export const AudioMonitor = (
    {url = "https://music.163.com/song/media/outer/url?id=31168317"}:{ url?: string }
) => {
    const [src, setSrc] = useState<string>(url)
    const {audioRef, state,
        autoPlay, setAutoPlay,
    } = useAudioState()

    useEffect(() => {
        setAutoPlay(false)
    }, []);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        setSrc(url);
        adjustHeight();
    }, [url]);

    return (
        <div className={cn("flex flex-col items-start justify-start",
            "text-foreground bg-background font-mono")}>
            <div>url:</div>
            <textarea onInput={adjustHeight}
                      ref={textareaRef} value={src} rows={1}
                      className="border w-full overflow-hidden"
                      onChange={(e) => setSrc(e.target.value)}/>
            <audio ref={audioRef} src={src} controls={true}/>
            <div>con: {state.connection}</div>
            <div>dat: {state.data}</div>
            <div>ply: {state.playback}</div>
            <label className={"w-fit flex items-center justify-center gap-2"}>
                缓冲就绪后，自动播放
                <input type={"checkbox"} className={"scale-130"} checked={autoPlay}
                       onChange={(e) => setAutoPlay(e.target.checked)}/>
            </label>
        </div>
    )
}