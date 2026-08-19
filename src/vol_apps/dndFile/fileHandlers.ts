import {handleCmSaveAs} from "@/vol_apps/cm/cm_ui_save_as.js";
import {getFileExt} from "@/vol_apps/tool/action/getFileExt.js";
import {persistedStoresBackup, persistedStoresRestore} from "@/vol_apps/tool/backupAndRestore.js";
import {
    bookmarksToTiles,
    buildBackupFileFromBookmarks,
    netscapeBookmarkFilePhaser
} from "@/vol_apps/tool/isType/isLikelyBookmarkFile.js";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {cmStore} from "@/vol_apps/cm/cm_atom.ts";
import {CmIsVisibleSig} from "@/vol_apps/cm/cm_open.tsx";

export interface FileHandlers {
    exportEditorContent: () => Promise<void>;
    readInCm: () => Promise<void>;
    DownloadBackup: () => Promise<void>;
    ImportBackup: () => Promise<void>;
    HandleCancel: () => Promise<void>;
    HandleContinue: () => Promise<void>;
}

export const createFileHandlers = (file: File): FileHandlers => {
    //纯文本文件
    const exportEditorContent = async () => {
        // const {doc, name, type} = cmStore;
        const {doc} = useSignal(cmStore("doc"))
        const {name} = useSignal(cmStore("name"))
        const {type} = useSignal(cmStore("type"))
        await handleCmSaveAs(doc, name, type);
    };

    const readInCm = async () => {
        // const {setDoc, setName, setType, setIsVisible} = cmStore;
        const {setDoc} = useSignal(cmStore("doc"))
        const {setName} = useSignal(cmStore("name"))
        const {setType} = useSignal(cmStore("type"))
        // const {setIsVisible} = useSignal(cmStore("isVisible"))
        const setIsVisible = CmIsVisibleSig.set

        setDoc(await file.text());
        setName(file.name);
        setType(getFileExt(file.name));
        setIsVisible(true);
    };

    //存档文件
    const DownloadBackup = async () => await persistedStoresBackup();
    const ImportBackup = async () => {
        await persistedStoresRestore(file);
    };

    //书签文件
    const HandleCancel = async () => {};

    const HandleContinue = async () => {
        const data = await netscapeBookmarkFilePhaser(file);
        const tiles = bookmarksToTiles(data);
        const fakeBackupFile = buildBackupFileFromBookmarks(tiles);
        await persistedStoresRestore(fakeBackupFile, true);
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