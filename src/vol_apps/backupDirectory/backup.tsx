import {useModalPortal} from "@/vol_apps/02_hooks/float/useModalPortal.tsx";
import {Button} from "@/components/ui/button.tsx";
import {toast} from "sonner";
import {del, get, set} from "idb-keyval";
import {getPersistedStoresBackupData} from "@/vol_apps/tool/backupAndRestore.ts";
import {tryStringify} from "@/vol_apps/tool/isType/isValidType.ts";
import {createSignal} from "@/vol_apps/04_persist_atoms";
import {useEffect, useState} from "react";
import {MessageCircleHeart, X} from "lucide-react";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";

export const backupOpenSignal = createSignal<boolean>(false);

const computeSHA256Hex = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const ensureReadWritePermission = async (directoryHandle: FileSystemDirectoryHandle): Promise<boolean> => {
    //@ts-ignore
    const permission = await directoryHandle.queryPermission({mode: "readwrite"});
    if (permission === "granted") return true;
    //@ts-ignore
    const requestPermission = await directoryHandle.requestPermission({mode: "readwrite"});
    return requestPermission === "granted";
};

const syncBackupHash = async (directoryHandle: FileSystemDirectoryHandle): Promise<string> => {
    try {
        const subDirHandle = await directoryHandle.getDirectoryHandle(DIR_NAME, {create: false});
        const fileHandle = await subDirHandle.getFileHandle(FILE_NAME);
        const file = await fileHandle.getFile();
        const text = await file.text();
        return await computeSHA256Hex(text);
    } catch (e) {
        return ""
    }
};

const IDB_KEY = "HomePageBackup"
const DIR_NAME = "HomePageBackup"
const FILE_NAME = `DB_latest.json`
const CHECK_DURATION = 1000 * 60 * 20

export const Backup = () => {
    const {t} = useLanguage("backup");

    const open = backupOpenSignal.use()
    const close = () => backupOpenSignal.set(false)

    // 这个功能不完全语义单一，但是为了保持简单，先不优化
    // 1.检查前置是否通畅(dir_handle 的存在性/权限)
    // 2.用户是否已启用功能
    const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [directoryReady, setDirectoryReady] = useState(false);

    const checkDirectoryHandle  = async (mute: boolean = true):Promise<FileSystemDirectoryHandle|null> => {
        const h = await get(IDB_KEY);
        if (!h) {
            if (!mute) toast.info(t("Select a directory first."));
            setDirectoryHandle(null)
            return null;
        }
        const permission = await ensureReadWritePermission(h)
        if (!permission) {
            if (!mute) toast.info(t("Permission denied"));
            setDirectoryHandle(null)
            return null
        }
        setDirectoryHandle(h)
        return h;
    };

    const initDirectoryHandleState = async () => {
        await checkDirectoryHandle (true)
        setDirectoryReady(true);
    }

    useEffect(() => {
        void initDirectoryHandleState ();
    }, []);

    // 启动后，尝试静默更新一次
    useEffect(() => {
        if (!directoryReady) return;
        if (!directoryHandle) return
        void handleBackup(true)
    }, [directoryReady]);

    // 20分钟一次，静默更新本地存档
    useEffect(() => {
        if (!directoryHandle) return
        const id = window.setInterval(() => {
            void handleBackup(true)
        }, CHECK_DURATION)
        return () => {
            clearInterval(id);
        }
    }, [directoryHandle]);

    const {modalPortal} = useModalPortal({
        open,
        onOpenChange: (isOpen: boolean) => {backupOpenSignal.set(isOpen)},
        duration: 200,
        exitDuration: 200,
        scale: 90,
        zIndex: 30,
    });

    const handleSelectDir = async () => {
        try {
            // @ts-ignore
            const h = await window.showDirectoryPicker();
            if (await ensureReadWritePermission(h)) {
                await set(IDB_KEY, h);
                setDirectoryHandle(h)
                // 非静默同步一次，响应用户操作
                await handleBackup(false)
            } else {
                toast.info(t("Permission denied."));
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;
        }
    }

    const handleBackup = async (mute: boolean = true) => {
        const dirHandle = await checkDirectoryHandle(mute)
        if (!dirHandle) return

        try {
            const diskHash = await syncBackupHash(dirHandle);

            const backupData = getPersistedStoresBackupData();
            const jsonContent = tryStringify(backupData);   //  tryStringify:(...)=>string
            const newHash = await computeSHA256Hex(jsonContent);

            if (newHash === diskHash) {
                if (!mute) toast.success(t("The local backup is already up to date. No update was needed."));
                return
            }

            const blob = new Blob([jsonContent], {type: "application/json;charset=utf-8"});
            const subDirHandle = await dirHandle.getDirectoryHandle(DIR_NAME, {create: true});
            const fileHandle = await subDirHandle.getFileHandle(FILE_NAME, {create: true});
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();

            if (!mute) toast.success(t("Local backup updated."));

        } catch (error: unknown) {
            if (error instanceof Error && error.name === "NotFoundError") {
                if (!mute) toast.error(t("The directory no longer exists or is inaccessible. Please select it again."));

                await del(IDB_KEY);
                setDirectoryHandle(null);
                return;
            }
            const message = error instanceof Error ? error.message : String(error);
            if (!mute) toast.error(t("Failed to write local backup: ") + message);
        }
    };

    return (
        modalPortal(
            <div className={"relative bg-background text-foreground border w-200 h-fit flex flex-col p-2 gap-2"}>
                <div className={"absolute top-0 right-0"}
                     onClick={close}
                >
                    <X />
                </div>
                <div>
                    <p>{t("Select a local directory.")}</p>
                    <p>{t("The plugin will create a HomePageBackup folder in the selected directory.")}</p>
                    <p>{t("All read and write operations are limited to this folder and will not affect other files.")}</p>
                </div>
                <div>
                    <p>{t("Backup Contents:")}</p>
                    <p>{t("Latest backup file: DB_latest.json")}</p>
                    <p>{t("File size is typically under 10 MB, but may be larger if many icons or high-resolution wallpapers are included.")}</p>
                </div>
                <div>
                    <p>{t("Sync Behavior:")}</p>
                    <p>{t("The plugin checks the local backup every 20 minutes. If it is outdated, it will overwrite it with the latest backup.")}</p>
                    <p>{t("Only the backup file is overwritten. No files are deleted.")}</p>
                </div>
                <div className={"flex flex-row items-center gap-2"}>
                    <Button className={"w-fit"} onClick={handleSelectDir}> {t("Select Directory")} </Button>
                    {
                        directoryHandle !== null ? (
                            <Button onClick={async () => {
                                    await del(IDB_KEY);
                                    setDirectoryHandle(null);
                                }}
                            >{t("Disable Auto Backup")}</Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <MessageCircleHeart />
                                <p>{t("Auto Backup Disabled")}</p>
                            </div>
                        )
                    }

                </div>
                <Button className={"w-fit"} onClick={() => {
                    void handleBackup(false)
                }}> {t("Check Sync")} </Button>

            </div>
        )
    );
};