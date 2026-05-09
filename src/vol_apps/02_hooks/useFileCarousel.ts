import {useCallback, useEffect, useRef, useState} from "react";
import {useInterval} from "@/vol_apps/02_hooks/03_useTimeout";
import {useShuffledIndex} from "@/vol_apps/02_hooks/useShuffledIndex";

export const useFileCarousel =
    ({
         open,
         handle,
         interval = 3000,
         random = false,
     }: {
        open: boolean;
        handle: (file: File) => void;
        interval?: number;
        random?: boolean;
    }) => {
        const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
        const [fileHandles, setFileHandles] = useState<FileSystemFileHandle[] | null>(null)
        const indexRef = useRef<number>(0)

        const handleRef = useRef(handle);
        handleRef.current = handle;

        // 重置索引
        useEffect(() => {
            indexRef.current = 0;
        }, [fileHandles]);

        const isReady = (): boolean => {
            return (
                open
                && dirHandle !== null
                && fileHandles !== null
                && fileHandles.length > 0
            );
        }

        // fileHandles
        useEffect(() => {
            if (!open || !dirHandle) {
                setFileHandles(null);
                return;
            }
            const init = async () => {
                const rawFiles: FileSystemFileHandle[] = [];
                for await (const item of dirHandle!.values()) {
                    if (item.kind === "file") {
                        rawFiles.push(item as FileSystemFileHandle);
                    }
                }
                setFileHandles(rawFiles);
            };
            void init();
        }, [open, dirHandle])


        const { get } = useShuffledIndex({length: fileHandles?.length || 0, random})

        //loop
        const loop = useCallback(async () => {
            if (!open || !fileHandles || fileHandles.length === 0) return;
            const idx = get(indexRef.current);
            const file = await fileHandles[idx].getFile();
            handleRef.current?.(file);
            indexRef.current++;
        }, [open, fileHandles])

        const { handleNext } = useInterval({open:isReady(), handler: loop, timeout: interval})

        return {
            dirHandle,
            setDirHandle,
            handleNext,
        };
    }