import {useCallback, useEffect, useRef, useState} from "react";
import {useRafThrottleSetState} from "@/vol_apps/02_hooks/throttle/useRafThrottleSetState";
import {useUserActivation} from "@/vol_apps/02_hooks/useUserInteracted";

/**
 * 连接层：网络是否可用
 */
type ConnectionState =
    | "idle"
    | "loading"
    | "ready"
    | "failed";

/**
 * 数据层：是否可播放
 */
type DataState =
    | "empty"
    | "loading"
    | "ready"
    | "decode_err"
    | "src_not_supported";

/**
 * 播放层：是否正在出声
 */
type PlaybackState =
    | "paused"
    | "playing";

type AudioState = {
    connection: ConnectionState;
    data: DataState;
    playback: PlaybackState;
};

/**
 * 只将网络错误或 NETWORK_NO_SOURCE 视为连接失败
 */
const getConnectionState = (audio: HTMLAudioElement): ConnectionState => {
    const ns = audio.networkState;
    const err = audio.error;

    if (!audio.src) return "idle";

    // 网络错误：code === 2
    if (err && err.code === MediaError.MEDIA_ERR_NETWORK) return "failed";
    // 没有可用源：networkState === 3
    if (ns === HTMLMediaElement.NETWORK_NO_SOURCE) return "failed";

    // 正常情况按 networkState 映射
    if (ns === HTMLMediaElement.NETWORK_LOADING) return "loading";
    if (ns === HTMLMediaElement.NETWORK_IDLE) return "ready";

    return "idle";
};

const getDataState = (audio: HTMLAudioElement): DataState => {
    const rs = audio.readyState;
    const err = audio.error;

    if (!audio.src) return "empty";

    if (err) {
        if (err.code === MediaError.MEDIA_ERR_DECODE) return "decode_err";
        if (err.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) return "src_not_supported";
        return "loading";
    }

    if (rs === HTMLMediaElement.HAVE_NOTHING) return "empty";
    if (rs === HTMLMediaElement.HAVE_METADATA || rs === HTMLMediaElement.HAVE_CURRENT_DATA) return "loading";
    if (rs >= HTMLMediaElement.HAVE_FUTURE_DATA) return "ready";

    return "empty";
};

const getPlaybackState = (audio: HTMLAudioElement): PlaybackState => {
    const playing =
        !audio.paused &&
        !audio.ended &&
        audio.currentTime > 0;

    return playing ? "playing" : "paused";
};

const computeState = (audio: HTMLAudioElement): AudioState => {
    return {
        connection: getConnectionState(audio),
        data: getDataState(audio),
        playback: getPlaybackState(audio),
    };
};


type AudioMeta = {
    duration: number;
    buffered: number;
    // 未来可扩展更多字段，如 seekable 等
};

export const useAudioState = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [src, setSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (audioRef.current && src) {
            audioRef.current.src = src;
            audioRef.current.load();
            if (autoPlay) void audioRef.current.play();
        }
    }, [src]);

    const [state, setState] = useState<AudioState>(() => ({
        connection: "idle",
        data: "empty",
        playback: "paused",
    }));

    const [meta, setMeta] = useState<AudioMeta>({
        duration: NaN,
        buffered: 0,
    });

    //单独处理
    const currentTimeRef = useRef(0);
    const [currentTime, setCurrentTime] = useState(0);

    // update currentTime per 50ms
    useRafThrottleSetState(currentTimeRef, setCurrentTime, 50);

    const syncState = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        setState(prev => {
            const next = computeState(audio);
            if (
                prev.connection === next.connection &&
                prev.data === next.data &&
                prev.playback === next.playback
            ) return prev;
            return next;
        });

        const newDuration = audio.duration;

        let newBuffered = 0;
        if (audio.buffered.length > 0) {
            newBuffered = audio.buffered.end(audio.buffered.length - 1);
        }
        setMeta(prev => {
            if (prev.duration !== newDuration || prev.buffered !== newBuffered) {
                return {duration: newDuration, buffered: newBuffered};
            }
            return prev;
        });

        currentTimeRef.current = audio.currentTime;

    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onEvents = () => syncState();

        const events: (keyof HTMLMediaElementEventMap)[] = [
            "loadstart",
            "loadedmetadata",
            "loadeddata",
            "progress",
            "canplay",
            "waiting",
            "playing",
            "pause",
            "ended",
            "error",
            "stalled",
            "suspend",
            "timeupdate",
            "durationchange",
        ];

        events.forEach((e) => audio.addEventListener(e, onEvents));
        syncState();

        return () => {
            events.forEach((e) => audio.removeEventListener(e, onEvents));
        };
    }, []);

    /**
     * 统一播放控制，自动处理浏览器自动播放策略
     */
    const tryPlay = useCallback(async (shouldPlay: boolean) => {
        const audio = audioRef.current;
        if (!audio) return;

        try {
            if (shouldPlay) {
                await audio.play();
            } else {
                audio.pause();
            }
        } catch {
            // 自动播放被阻止、或其它运行时错误，状态同步交给 finally
        } finally {
            syncState();
        }
    }, [syncState]);


    const connectionIsFialed = state.connection === "failed"

    // 如果src连接失败，提供一个接口
    const handleFailedRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!handleFailedRef.current) return;
        if (!connectionIsFialed) return
        const timer = setTimeout(() => handleFailedRef.current?.(), 1500);
        return () => clearTimeout(timer);
    }, [connectionIsFialed]);

    // 如果缓冲好了，是否自动播放（需要用户有过交互）
    const hasUserInteracted = useUserActivation();
    const [autoPlay, setAutoPlay] = useState<boolean>(false)

    useEffect(() => {
        if (!hasUserInteracted) return
        setAutoPlay(true);
    }, [hasUserInteracted]);

    useEffect(() => {
        if (!autoPlay) return
        if (!audioRef.current) return;
        if (state.data !== "ready") return
        if (!hasUserInteracted) return;
        const timer = setTimeout(() => tryPlay(true), 1000);
        return () => clearTimeout(timer);
    }, [state.data, autoPlay]);

    const isPlaying = state.playback === "playing"
    const togglePlay = async () => {
        await tryPlay(!isPlaying);
    }

    const rePlay = async () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = 0;
        await tryPlay(true);
    }

    const seekTo = (ratio: number) => {
        if (!audioRef.current) return;
        ratio = Math.max(0, Math.min(ratio, 1));
        audioRef.current.currentTime = meta.duration * ratio;
    }

    return {
        audioRef,
        state,
        meta,
        currentTime,seekTo,

        //src
        src, setSrc,

        // 快捷操作
        isPlaying,
        tryPlay, togglePlay,
        autoPlay, setAutoPlay,
        handleFailedRef,
        rePlay,
    };
};