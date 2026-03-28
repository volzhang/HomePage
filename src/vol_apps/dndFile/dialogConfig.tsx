// dialogConfig.tsx
import {DialogClose} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import type {FileHandlers} from "./fileHandlers";
import type {ReactNode} from "react";

export type FileType = "textFile" | "backupFile" | "bookmarkFile" | "unknown";

interface DialogConfig {
    title: ReactNode;
    description: ReactNode;
    footer: ReactNode;
}

export const getDialogConfig = (
    file: File,
    fileType: FileType,
    handlers: FileHandlers,
    t: (key: string) => string
): DialogConfig => {
    const configs = {
        textFile: {
            title: <div>{t("Detected File:")}</div>,
            description: (
                <div className="space-y-2">
                    <div className="font-bold text-foreground">{file.name}</div>
                    <div className="whitespace-nowrap">{t("Open in editor?")}</div>
                    <div className="whitespace-nowrap">{t("Editor content will be replaced.")}</div>
                    <div className="whitespace-nowrap">{t("Unsaved changes will be lost.")}</div>
                    <div className="font-bold text-green-600">{t("Export first to avoid loss.")}</div>
                </div>
            ),
            footer: (
                <div className="flex gap-2">
                    <Button variant="default" onClick={handlers.exportEditorContent}>
                        {t("Export Editor content")}
                    </Button>
                    <DialogClose asChild>
                        <Button variant="destructive" onClick={handlers.readInCm}>
                            {t("Replace & Open")}
                        </Button>
                    </DialogClose>
                </div>
            ),
        },
        backupFile: {
            title: <div>{t("Detected Backup File:")}</div>,
            description: (
                <div className="space-y-2">
                    <div className="font-bold text-foreground">{file.name}</div>
                    <div className="whitespace-nowrap">{t("Restore this backup?")}</div>
                    <div className="whitespace-nowrap">{t("All data and settings will be overwritten.")}</div>
                    <div className="whitespace-nowrap">{t("Unsaved changes will be lost.")}</div>
                    <div className="font-bold text-green-600">{t("Download current backup first.")}</div>
                </div>
            ),
            footer: (
                <div className="flex gap-2">
                    <Button variant="default" onClick={handlers.DownloadBackup}>
                        {t("Download Backup")}
                    </Button>
                    <DialogClose asChild>
                        <Button variant="destructive" onClick={handlers.ImportBackup}>
                            {t("Restore Backup")}
                        </Button>
                    </DialogClose>
                </div>
            ),
        },
        bookmarkFile: {
            title: <div>{t("Detected Bookmark File:")}</div>,
            description: (
                <div className="space-y-2">
                    <div className="font-bold text-foreground">{file.name}</div>
                    <div className="whitespace-nowrap">{t("Continue?")}</div>
                    <div
                        className="whitespace-nowrap">{t("This will automatically parse bookmarks: generate tiles and tags.")}</div>
                    <div className="whitespace-nowrap">{t("The parsed data will be appended to your tiles wall.")}</div>
                    <div className="font-bold text-green-600">{t("This process will not damage existing data.")}</div>
                </div>
            ),
            footer: (
                <div className="flex gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary" onClick={handlers.HandleCancel}>
                            {t("Cancel")}
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button variant="default" onClick={handlers.HandleContinue}>
                            {t("Continue")}
                        </Button>
                    </DialogClose>
                </div>
            ),
        },
        unknown: {
            title: <div>{t("Unknown File")}</div>,
            description: (
                <div className="space-y-2">
                    <div className="font-bold text-foreground">{file.name}</div>
                    <div className="whitespace-nowrap">{t("This file type is not supported.")}</div>
                    <div
                        className="text-muted-foreground">{t("Please try a text file, backup file, or bookmark file.")}</div>
                </div>
            ),
            footer: (
                <DialogClose asChild>
                    <Button variant="secondary">{t("Close")}</Button>
                </DialogClose>
            ),
        },
    };

    return configs[fileType];
};