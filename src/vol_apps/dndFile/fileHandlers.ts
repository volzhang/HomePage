import {handleCmSaveAs} from "@/vol_apps/cm/cm_ui_save_as.js";
import {getFileExt} from "@/vol_apps/tool/action/getFileExt.js";
import {localforageBackup, localforageRestore} from "@/vol_apps/tool/backupAndRestore.js";
import {
    bookmarksToTiles,
    buildBackupFileFromBookmarks,
    netscapeBookmarkFilePhaser
} from "@/vol_apps/tool/isType/isLikelyBookmarkFile.js";

export interface FileHandlers {
    exportEditorContent: () => Promise<void>;
    readInCm: () => Promise<void>;
    DownloadBackup: () => Promise<void>;
    ImportBackup: () => Promise<void>;
    HandleCancel: () => Promise<void>;
    HandleContinue: () => Promise<void>;
}

export const createFileHandlers = (file: File, cmStore: any): FileHandlers => {
    //纯文本文件
    const exportEditorContent = async () => {
        const {doc, name, type} = cmStore;
        await handleCmSaveAs(doc, name, type);
    };

    const readInCm = async () => {
        const {setDoc, setName, setType, setIsVisible} = cmStore;
        setDoc(await file.text());
        setName(file.name);
        setType(getFileExt(file.name));
        setIsVisible(true);
    };

    //存档文件
    const DownloadBackup = async () => await localforageBackup();
    const ImportBackup = async () => {
        await localforageRestore(file);
    };

    //书签文件
    const HandleCancel = async () => {
    };

    const HandleContinue = async () => {
        const data = await netscapeBookmarkFilePhaser(file);
        const tiles = bookmarksToTiles(data);
        const fakeBackupFile = buildBackupFileFromBookmarks(tiles);
        await localforageRestore(fakeBackupFile, true);
    };

    return {
        exportEditorContent,
        readInCm,
        DownloadBackup,
        ImportBackup,
        HandleCancel,
        HandleContinue,
    };
};