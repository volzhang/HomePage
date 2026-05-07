import { useEffect, useState } from "react";

interface Options {
    open: boolean;
    handle: (file: File) => void;
    interval?: number;
}

export function useFileCarousel({
                                    open,
                                    handle,
                                    interval = 3000,
                                }: Options) {
    const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);

    useEffect(() => {
        if (!open || !dirHandle) return;
        let timer: number;
        let index = 0;

        const init = async () => {
            const files: FileSystemFileHandle[] = [];

            for await (const item of dirHandle.values()) {
                if (item.kind === "file") {
                    files.push(item as FileSystemFileHandle);
                }
            }

            if (files.length === 0) return;

            const run = async () => {
                const file = await files[index % files.length].getFile();
                handle(file);
            };

            void run();

            timer = window.setInterval(() => {
                index++;
                void run();
            }, interval);
        };

        void init();

        return () => {
            clearInterval(timer);
        };
    }, [open, dirHandle, interval, handle]);

    return {
        dirHandle,
        setDirHandle,
    };
}