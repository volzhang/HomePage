import React, {useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";

export const TransitionImage = (
    {
        src,
        alt = "",
        duration = 1500,
        className,
        ...props
    }: {
        src: string | undefined;
        alt?: string;
        duration?: number;
        className?: string;
    } & React.ComponentPropsWithoutRef<"div">
) => {
    const [frontSrc, setFrontSrc] = useState<string | undefined>(undefined);
    const [backSrc, setBackSrc] = useState<string | undefined>(undefined);
    const [isFrontActive, setIsFrontActive] = useState(true);

    const timeoutRef = useRef<number | null>(null);
    const prevSrcRef = useRef(src);

    const startTransition = (newSrc: string | undefined) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (isFrontActive) {
            setBackSrc(newSrc);
            setIsFrontActive(false);
            timeoutRef.current = setTimeout(() => setFrontSrc(undefined), duration);
        } else {
            setFrontSrc(newSrc);
            setIsFrontActive(true);
            timeoutRef.current = setTimeout(() => setBackSrc(undefined), duration);
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

    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        userSelect: 'none',
        pointerEvents: 'none',
        transition: `opacity ${duration}ms ease-in-out`,
    };

    return (
        <div className={cn("relative w-[200px] h-[200px]", className)} {...props}>
            <img src={frontSrc} alt={alt} draggable={false}
                style={{
                    ...baseStyle,
                    opacity: isFrontActive ? 1 : 0,
                }}
            />
            <img src={backSrc!} alt={alt} draggable={false}
                style={{
                    ...baseStyle,
                    opacity: isFrontActive ? 0 : 1,
                }}
            />
        </div>
    );
};