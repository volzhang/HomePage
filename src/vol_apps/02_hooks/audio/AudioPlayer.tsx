// 返回原生组件audio，和调试界面，方便后续套壳


import {useAudioContext} from "@/vol_apps/02_hooks/audio/AudioContext";
import {useEffect, useRef} from "react";
import {cn} from "@/lib/utils";

interface AudioPlayerProps extends React.ComponentPropsWithoutRef<"audio"> {
    // 可以添加自定义属性，例如 showDebug 等
    open?: boolean;
    children?: React.ReactNode;
}

export const AudioPlayer  = (
    {
        open = true,
        children,
        ...audioProps
    } : AudioPlayerProps
    = {}
    ) => {
    const {
        audioRef, state,
        src, setSrc,
        autoPlay, setAutoPlay
    } = useAudioContext()

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [src]);

    return (
        <>
            {open &&
            <div>
                <audio controls={true} ref={audioRef} {...audioProps}/>
                <div className={cn("flex flex-col items-start justify-start",
                    "text-foreground bg-background font-mono")}>
                    <textarea onInput={adjustHeight}
                              ref={textareaRef} value={src}
                              className="border w-full overflow-hidden"
                              onChange={(e) => setSrc(e.target.value)}/>
                    <div>con: {state.connection}</div>
                    <div>dat: {state.data}</div>
                    <div>ply: {state.playback}</div>
                    <label className={"w-fit flex items-center justify-center gap-2"}>
                        缓冲就绪时自动播放
                        <input type={"checkbox"} className={"scale-120"} checked={autoPlay}
                               onChange={(e) => setAutoPlay(e.target.checked)}/>
                    </label>
                </div>
                {children}
            </div>
            }
        </>
    );
};
