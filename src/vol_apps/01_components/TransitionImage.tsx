import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type TransitionImageProps = {
    src: string | undefined;
    duration?: number;
    timingFunction?: string;
    alt?: string;
};

export const TransitionImage = (
    {
    src,
    duration = 1000,
    timingFunction = "ease-in-out",
    alt = "",
    }: TransitionImageProps) => {
    const [frontSrc, setFrontSrc] = useState<string | undefined>(undefined);
    const [backSrc, setBackSrc] = useState<string | undefined>(undefined);
    const [isFrontActive, setIsFrontActive] = useState(true);

    const timeoutRef = useRef<number | null>(null);
    const prevSrcRef = useRef(src);

    const startTransition = (newSrc: string | undefined) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (isFrontActive) {
            // 新图放入 back，front 继续淡出
            setBackSrc(newSrc);
            setIsFrontActive(false);

            timeoutRef.current = window.setTimeout(() => {
                setFrontSrc(undefined);
                timeoutRef.current = null;
            }, duration);
        } else {
            setFrontSrc(newSrc);
            setIsFrontActive(true);

            timeoutRef.current = window.setTimeout(() => {
                setBackSrc(undefined);
                timeoutRef.current = null;
            }, duration);
        }
    };

    useEffect(() => {
        if (prevSrcRef.current === src) return;
        prevSrcRef.current = src;

        startTransition(src ?? undefined);
    }, [src]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const imageStyle: CSSProperties = {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        userSelect: "none",
        pointerEvents: "none",
        transition: `opacity ${duration}ms ${timingFunction}`,
    };

    return (
        <div className={cn("relative w-full h-full")}>
            <img
                src={frontSrc}
                alt={alt}
                draggable={false}
                style={{ ...imageStyle, opacity: isFrontActive ? 1 : 0 }}
            />
            <img
                src={backSrc!}
                alt={alt}
                draggable={false}
                style={{ ...imageStyle, opacity: isFrontActive ? 0 : 1 }}
            />
        </div>
    );
};