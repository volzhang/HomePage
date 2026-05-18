// 受控
import {AudioUI_progressbar} from "@/vol_apps/01_components/audio/AudioUI_progressbar";
import {useAudioContext} from "@/vol_apps/01_components/audio/AudioContext";

export const AudioUI = () => {
    const {meta, currentTime, seekTo} = useAudioContext()

    const progressbarMeta = {
        duration: meta.duration,
        bufferedDuration: meta.buffered,
        currentTime,
    }

    const onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, x / rect.width));
        seekTo(ratio);
    }

    return (
        <>

            <AudioUI_progressbar meta={progressbarMeta} onSeek={onSeek}></AudioUI_progressbar>
        </>
    )
}