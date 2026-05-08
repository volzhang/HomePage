import { useEffect, useRef, useState } from "react";

interface Options {
    open: boolean;
    handle: (file: File) => void;
    interval?: number;      //单位秒
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
    const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const handleRef = useRef(handle);
    const filesRef = useRef<FileSystemFileHandle[]>([]);
    const indexRef = useRef(0);

    // 始终保持 handleRef 为最新的 handle 函数
    useEffect(() => {
        handleRef.current = handle;
    }, [handle]);

    useEffect(() => {
        if (!open || !dirHandle) return;
        let timer: number;

        const init = async () => {
            const rawFiles: FileSystemFileHandle[] = [];
            for await (const item of dirHandle.values()) {
                if (item.kind === "file") {
                    rawFiles.push(item as FileSystemFileHandle);
                }
            }
            if (rawFiles.length === 0) return;

            // 初始顺序：是否需要随机
            filesRef.current = random ? shuffle(rawFiles) : rawFiles;
            indexRef.current = 0;

            const run = () => {
                const fileHandle = filesRef.current[indexRef.current % filesRef.current.length];
                fileHandle.getFile().then(handleRef.current);
            };

            // 立即播放第一个
            run();

            timer = window.setInterval(() => {
                indexRef.current++;

                // 如果启用了随机，并且刚刚播放完一整轮，则重新洗牌并重置索引
                if (random && indexRef.current % filesRef.current.length === 0) {
                    filesRef.current = shuffle(filesRef.current);
                    indexRef.current = 0;
                }

                // 处理当前文件
                const fileHandle = filesRef.current[indexRef.current % filesRef.current.length];
                fileHandle.getFile().then(handleRef.current);
            }, interval * 1000);
        };

        void init();

        return () => {
            clearInterval(timer);
        };
    }, [open, dirHandle, interval, random]);

    return {
        dirHandle,
        setDirHandle,
    };
}