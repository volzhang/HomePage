import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
    open: boolean;
    handle: (file: File) => void;
    interval?: number; // 秒
    random?: boolean;
}

function shuffle<T>(array: T[]): T[] {
    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

export function useFileCarousel({
                                    open,
                                    handle,
                                    interval = 3,
                                    random = false,
                                }: Options) {
    const [dirHandle, setDirHandle] =
        useState<FileSystemDirectoryHandle | null>(null);

    const handleRef = useRef(handle);

    const filesRef = useRef<FileSystemFileHandle[]>([]);

    const indexRef = useRef(0);

    const openRef = useRef(open);

    useEffect(() => {
        handleRef.current = handle;
    }, [handle]);

    useEffect(() => {
        openRef.current = open;
    }, [open]);

    const playNext = useCallback(async () => {
        // 非 open
        if (!openRef.current) return;

        const files = filesRef.current;

        if (files.length === 0) return;

        // 一轮播放结束后重新洗牌
        if (
            random &&
            indexRef.current > 0 &&
            indexRef.current % files.length === 0
        ) {
            filesRef.current = shuffle(filesRef.current);

            indexRef.current = 0;
        }

        const fileHandle =
            filesRef.current[
            indexRef.current % filesRef.current.length
                ];

        indexRef.current++;

        const file = await fileHandle.getFile();

        handleRef.current(file);
    }, [random]);

    useEffect(() => {
        if (!open || !dirHandle) return;

        let timer: number;

        let destroyed = false;

        const init = async () => {
            const rawFiles: FileSystemFileHandle[] = [];

            for await (const item of dirHandle.values()) {
                if (item.kind === "file") {
                    rawFiles.push(item as FileSystemFileHandle);
                }
            }

            if (destroyed) return;

            if (rawFiles.length === 0) return;

            filesRef.current = random
                ? shuffle(rawFiles)
                : rawFiles;

            indexRef.current = 0;

            // 立即播放第一个
            void playNext();

            timer = window.setInterval(() => {
                void playNext();
            }, interval * 1000);
        };

        void init();

        return () => {
            destroyed = true;

            clearInterval(timer);
        };
    }, [open, dirHandle, interval, random, playNext]);

    return {
        dirHandle,
        setDirHandle,

        handleNext: () => {
            void playNext();
        },
    };
}