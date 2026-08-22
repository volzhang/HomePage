import {useModalPortal} from "@/vol_apps/02_hooks/float/useModalPortal.tsx";
import {Button} from "@/components/ui/button.tsx";
import {toast} from "sonner";
import {del, get, set} from "idb-keyval";
import {getPersistedStoresBackupData, persistedStoresRestore} from "@/vol_apps/tool/backupAndRestore.ts";
import {tryStringify} from "@/vol_apps/tool/isType/isValidType.ts";
import {createSignal} from "@/vol_apps/04_persist_atoms";
import {type ReactNode, useEffect, useState} from "react";
import {Folder, LoaderCircle, MessageCircleHeart} from "lucide-react";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {cn} from "@/lib/utils.ts";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion.tsx";
import {BackUpChoose, chooseOpenSignal} from "@/vol_apps/backupDirectory/choose.tsx";

const SyncButton = ({
                        children,
                        onClick,
                        className,
                    }: {
    children?: ReactNode;
    duration?: number;
    onClick?: () => void;
    className?: string;
}) => {
    const [disabled, setDisabled] = useState(false);
    useEffect(() => {
        if (!disabled) return;
        const id = setTimeout(() => setDisabled(false), 600);
        return () => clearTimeout(id);
    }, [disabled]);
    return (
        // 为了美观，不用原生的disabled，手动简单处理
        <Button
            variant={"outline"}
            className={cn("items-center", className)}
            onClick={() => {
                if (disabled) return;
                setDisabled(true)
                onClick?.()
            }}
        >
            <LoaderCircle strokeWidth={4}
                          className={cn(`animate-[spin_600ms_linear_infinite]`, "scale-x-120 scale-y-120")}
                          style={{animationPlayState: disabled ? "running" : "paused"}}
            />
            {children}
        </Button>
    )
}

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
        if (e instanceof DOMException && e.name === 'InvalidStateError') {
            throw e; // 让上层清理
        }
        return "";
    }
};

const hasBackup = async (directoryHandle: FileSystemDirectoryHandle): Promise<boolean> => {
    try {
        const subDirHandle = await directoryHandle.getDirectoryHandle(DIR_NAME, {create: false});
        await subDirHandle.getFileHandle(FILE_NAME);
        return true;
    } catch (e) {
        if (e instanceof DOMException && e.name === "InvalidStateError") {
            throw e;
        }
        return false;
    }
};

const IDB_KEY = "HomePageBackup"
const DIR_NAME = "HomePageBackup"
const FILE_NAME = `DB_latest.json`
const CHECK_DURATION = 1000 * 60 * 20

export const Backup = () => {
    const {t} = useLanguage("backup");

    const open = backupOpenSignal.use()
    // const close = () => backupOpenSignal.set(false)

    // 这个功能不完全语义单一，但是为了保持简单，先不优化
    // 1.检查前置是否通畅(dir_handle 的存在性/权限)
    // 2.用户是否已启用功能
    const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [directoryReady, setDirectoryReady] = useState(false);

    // 传参用的，临时记录当前选择的 FileSystemDirectoryHandle
    const [chooseDirectory, setChooseDirectory] = useState<FileSystemDirectoryHandle | null>(null);

    const checkDirectoryHandle = async (mute: boolean = true): Promise<FileSystemDirectoryHandle | null> => {
        const h = await get(IDB_KEY);
        if (!h) {
            if (!mute) toast.info(t("Select a directory first."));
            setDirectoryHandle(null)
            return null;
        }
        const permission = await ensureReadWritePermission(h)
        if (!permission) {
            if (!mute) toast.info(t("Permission denied."));
            setDirectoryHandle(null)
            return null
        }
        setDirectoryHandle(h)
        return h;
    };

    const initDirectoryHandleState = async () => {
        await checkDirectoryHandle(true)
        setDirectoryReady(true);
    }

    useEffect(() => {
        void initDirectoryHandleState();
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
        onOpenChange: (isOpen: boolean) => {
            backupOpenSignal.set(isOpen)
        },
        duration: 250,
        exitDuration: 250,
        scale: 90,
        zIndex: 30,
    });

    const overwrite = async (h: FileSystemDirectoryHandle|null) => {
        if (!h) return

        await set(IDB_KEY, h);
        setDirectoryHandle(h)
        // 非静默同步一次，响应用户操作
        await handleBackup(false)
        setChooseDirectory(null);
    };

    const restore = async (h: FileSystemDirectoryHandle|null) => {
        if (!h) return

        const subDirHandle = await h.getDirectoryHandle(DIR_NAME, {create: false});
        const fileHandle = await subDirHandle.getFileHandle(FILE_NAME);
        const file = await fileHandle.getFile();

        await persistedStoresRestore(file);

        await set(IDB_KEY, h);
        setDirectoryHandle(h);

        toast.success(t("Backup Restored."));
        setChooseDirectory(null);
    };

    const cancel = () => {
        toast.info(t("Backup Canceled."));
        setChooseDirectory(null);
    }

    const handleSelectDir = async () => {
        try {
            // @ts-ignore
            const h = await window.showDirectoryPicker();

            if (!(await ensureReadWritePermission(h))) {
                toast.info(t("Permission denied."));
                return;
            }

            const has_backup = await hasBackup(h)

            if (!has_backup) {
                await overwrite(h)
                return
            }

            setChooseDirectory(h);
            chooseOpenSignal.set(true)

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
            if (error instanceof DOMException &&
                (error.name === "InvalidStateError" || error.name === "NotFoundError")) {
                if (!mute) toast.error(t("The directory no longer exists or is inaccessible. Please select it again."));

                await del(IDB_KEY);
                setDirectoryHandle(null);
                return;
            }
            const message = error instanceof Error ? error.message : String(error);
            if (!mute) toast.error(t("Failed to write local backup: ") + message);
            console.error(message);
        }
    };

    const [accordionValue, setAccordionValue] = useState<string>("");

    return (
        <>
            {
                modalPortal(
                    <div className={cn("relative",
                        "bg-background text-foreground ",
                        "border text-md w-160 h-fit flex flex-col p-2 gap-2 rounded-md")}>
                        {/*<div className={"absolute top-0 right-0"} onClick={close}><X/></div>*/}

                        <div className={"mx-2 mt-4 flex flex-col gap-2"}>
                            <Button className={"h-10 hover:bg-sBlue hover:text-white"} onClick={handleSelectDir}
                                    variant={"default"}
                            >
                                <Folder className={"scale-x-120 scale-y-120"}/>
                                <p className={"text-[16px]"}>{t("Select Directory")}</p>
                            </Button>

                            <SyncButton
                                onClick={() => {
                                    void handleBackup(false)
                                }}
                                className={"h-10 hover:bg-sBlue! hover:text-white!"}>
                                <p className={"text-[16px]"}>{t("Check Sync")}</p>
                            </SyncButton>

                            <Button
                                variant={"outline"}
                                className={"h-10 hover:bg-sBlue! hover:text-white!"}
                                disabled={directoryHandle === null}
                                onClick={async () => {
                                    await del(IDB_KEY);
                                    setDirectoryHandle(null);
                                }}>
                                {
                                    <p className={"text-[16px]"}>
                                        {directoryHandle === null
                                            ? t("Auto Backup Disabled")
                                            : t("Disable Auto Backup")
                                        }
                                    </p>
                                }
                            </Button>
                        </div>

                        <Accordion type={"single"} value={accordionValue} collapsible
                                   onValueChange={setAccordionValue}>
                            <AccordionItem value={"info"}>
                                <AccordionTrigger className={"mx-4 text-[16px] [&>svg]:hidden"}>
                                    <div className={cn("flex items-center gap-2")}>
                                        <MessageCircleHeart/>
                                        {
                                            <p>
                                                {accordionValue === 'info'
                                                    ? t("Collapse Details")   // 展开时显示
                                                    : t("More Details...") // 折叠时显示
                                                }
                                            </p>
                                        }
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className={"space-y-4 mx-4"}>
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
                                    </div>

                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )
            }
            <BackUpChoose
                directoryHandle={chooseDirectory}
                overwrite={overwrite}
                restore={restore}
                cancel={cancel}
            />
        </>
    );
};