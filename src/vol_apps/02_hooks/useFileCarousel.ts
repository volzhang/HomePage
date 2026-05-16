import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useInterval} from "@/vol_apps/02_hooks/03_useTimeout";
import {useShuffledIndex} from "./random/useShuffledIndex";

type AcceptType = "ALL" | "IMAGE" | "TEXT";

/**
 * 根据 accept 生成文件过滤器（基于 MIME 类型）
 * @param accept 过滤模式
 * @returns 过滤器函数，如果 accept === "ALL" 则返回 null
 */
const createFilterByAccept = (accept: AcceptType) => {
    if (accept === "ALL") return null;

    return async (fileHandle: FileSystemFileHandle): Promise<boolean> => {
        const file = await fileHandle.getFile();
        const mime = file.type;

        if (accept === "IMAGE") {
            return mime.startsWith("image/");
        }

        if (accept === "TEXT") {
            // 常见文本 MIME 类型
            return (
                mime.startsWith("text/") ||
                mime === "application/json" ||
                mime === "application/javascript" ||
                mime === "application/xml" ||
                mime === "application/x-httpd-php" ||
                mime === "application/x-sh" ||
                mime === "application/x-csh" ||
                mime === "application/x-tex" ||
                mime.startsWith("application/") && mime.includes("+xml") // 例如 application/rss+xml
            );
        }

        return false;
    };
};


export const useFileCarousel =
    ({
         open,
         handle,
         interval = 3000,
         random = false,
         accept = "ALL",
     }: {
        open: boolean;
        handle: (file: File) => void;
        interval?: number;
        random?: boolean;
        accept?: AcceptType;
    }) => {
        const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
        const [fileHandles, setFileHandles] = useState<FileSystemFileHandle[] | null>(null)
        const indexRef = useRef<number>(0)

        const handleRef = useRef(handle);
        handleRef.current = handle;

        const filterFn = useMemo(() => createFilterByAccept(accept), [accept]);

        // 重置索引
        useEffect(() => {
            indexRef.current = 0;
        }, [fileHandles]);

        const isReady =
            open
            && dirHandle !== null
            && fileHandles !== null
            && fileHandles.length > 0;

        // fileHandles
        useEffect(() => {
            if (!open || !dirHandle) {
                setFileHandles(null);
                return;
            }

            let cancelled = false;

            const init = async () => {
                const collected: FileSystemFileHandle[] = [];
                for await (const item of dirHandle.values()) {
                    if (item.kind === "file") {
                        const fileHandle = item as FileSystemFileHandle;
                        if (!filterFn) {
                            collected.push(fileHandle);
                        } else {
                            const passed = await filterFn(fileHandle);
                            if (passed) collected.push(fileHandle);
                        }
                    }
                }
                if (!cancelled) setFileHandles(collected);
            };
            void init();
            return () => {
                cancelled = true;
            };
        }, [open, dirHandle, filterFn])


        const {get} = useShuffledIndex({length: fileHandles?.length || 0, random})

        //loop
        const loop = useCallback(async () => {
            if (!open || !fileHandles || fileHandles.length === 0) return;
            const idx = get(indexRef.current);
            const file = await fileHandles[idx].getFile();
            handleRef.current?.(file);
            indexRef.current++;
        }, [open, fileHandles, get])

        const {handleNext} = useInterval({open: isReady, handler: loop, timeout: interval})

        return {
            dirHandle,
            setDirHandle,
            handleNext,
        };
    }