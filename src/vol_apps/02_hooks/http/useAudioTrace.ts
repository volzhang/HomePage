import { useEffect, useRef, useState } from "react";

type AudioState = "idle" | "loading" | "success" | "failed";
type AudioError = "empty_url" | "audio_error" | "timeout";

export const useAudioTrace = (url: string | null | undefined, timeoutMs = 4000) => {
    const [state, setState] = useState<AudioState>("idle");
    const [error, setError] = useState<AudioError | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const isMounted = useRef(true);

    const start = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current = null;
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (!url) {
            setState("failed");
            setError("empty_url");
            return;
        }

        setState("loading");
        setError(null);

        const audio = new Audio();
        audioRef.current = audio;
        audio.preload = "metadata";

        let hasSucceeded = false;

        const markSuccess = () => {
            if (hasSucceeded || !isMounted.current) return;
            hasSucceeded = true;
            cleanup();
            setState("success");
            setError(null);
        };

        const markFailed = (err: AudioError) => {
            if (hasSucceeded || !isMounted.current) return;
            cleanup();
            setState("failed");
            setError(err);
        };

        const cleanup = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (audioRef.current) {
                audio.onloadedmetadata = null;
                audio.oncanplay = null;
                audio.onerror = null;
                audio.pause();
                audio.src = "";
                audioRef.current = null;
            }
        };

        audio.onloadedmetadata = markSuccess;
        audio.oncanplay = markSuccess;

        // 关键补充：加上 onerror
        audio.onerror = () => {
            if (hasSucceeded || !isMounted.current) return;
            markFailed("audio_error");
        };

        timeoutRef.current = window.setTimeout(() => {
            markFailed("timeout");
        }, timeoutMs);

        audio.src = url;
    };

    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        };
    }, []);

    return { state, error, start };
};