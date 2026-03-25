import {useCmStore} from "@/vol_apps/cm/cm_store";
import {handleCmSaveAs} from "@/vol_apps/cm/cm_ui_save_as";
import {DndFileUiModal} from "@/vol_apps/dndFile/dndFile_ui_modal";
import {useFileDnD} from "@/vol_apps/dndFile/useFileDnD";
import {getFileExt} from "@/vol_apps/tool/action/getFileExt";
import {localforageBackup, localforageRestore} from "@/vol_apps/tool/backupAndRestore";
import {bookmarksToTiles, buildBackupFileFromBookmarks, netscapeBookmarkFilePhaser} from "@/vol_apps/tool/isType/isLikelyBookmarkFile";
import {useTranslation} from "react-i18next";
import {DialogClose} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

export const DndFile = () => {
	const {t} = useTranslation("dndFile");
	const {doc, name, type, setDoc, setName, setType, setIsVisible} = useCmStore();
	const {file, openModal, setOpenModal, fileType} = useFileDnD();

	//纯文本文件
	const exportEditorContent = async () => await handleCmSaveAs(doc, name, type);
	const readInCm = async () => {
		if (!file) return;
		setDoc(await file.text());
		setName(file.name);
		setType(getFileExt(file.name));
		setIsVisible(true);
	};

	//存档文件
	const DownloadBackup = async () => await localforageBackup();
	const ImportBackup = async () => {
		if (!file) return; //理论上不可能
		await localforageRestore(file);
	};

	//书签文件
	const HandleCancel = async () => {
	};
	const HandleContinue = async () => {
		if (!file) return; //理论上不可能
		const data = await netscapeBookmarkFilePhaser(file)
		const tiles = bookmarksToTiles(data)
		const fakeBackupFile = buildBackupFileFromBookmarks(tiles)
		await localforageRestore(fakeBackupFile, true)
	};

	const dialogConfig = {
		"textFile": {
			title: (<span>{t("Detected File:")}</span>),
			description: (<>
				<span className={"font-bold text-foreground"}>{file?.name}</span><br/>
				<span className={"whitespace-nowrap"}>{t("Open in editor?")}</span><br/>
				<br/>
				<span className={"whitespace-nowrap"}>{t("Editor content will be replaced.")}</span><br/>
				<span className={"whitespace-nowrap"}>{t("Unsaved changes will be lost.")}</span><br/>
				<span className={"font-bold text-green-600"}>{t("Export first to avoid loss.")}</span><br/>
				<br/>
			</>),
			footer: (<>
				<Button variant="default" onClick={exportEditorContent}>
					{t("Export Editor content")}
				</Button>
				<DialogClose asChild>
					<Button variant="destructive" onClick={readInCm}>
						{t("Replace & Open")}
					</Button>
				</DialogClose>
			</>),
		},
		"backupFile": {
			title: (<span>{t("Detected Backup File:")}</span>),
			description: (<>
				<span className={"font-bold text-foreground"}>{file?.name}</span><br/>
				<span className={"whitespace-nowrap"}>{t("Restore this backup?")}</span><br/>
				<br/>
				<span className={"whitespace-nowrap"}>{t("All data and settings will be overwritten.")}</span><br/>
				<span className={"whitespace-nowrap"}>{t("Unsaved changes will be lost.")}</span><br/>
				<span className={"font-bold text-green-600"}>{t("Download current backup first.")}</span><br/>
				<br/>
			</>),
			footer: (<>
				<Button variant="default" onClick={DownloadBackup}>
					{t("Download Backup")}
				</Button>
				<DialogClose asChild>
					<Button variant="destructive" onClick={ImportBackup}>
						{t("Restore Backup")}
					</Button>
				</DialogClose>
			</>),
		},
		"bookmarkFile": {
			title: (<span>{t("Detected Bookmark File:")}</span>),
			description: (<>
				<span className={"font-bold text-foreground"}>{file?.name}</span><br/>
				<span className={"whitespace-nowrap"}>{t("Continue?")}</span><br/>
				<br/>
				<span className={"whitespace-nowrap"}>{t("This will automatically parse bookmarks: generate tiles and tags.")}</span><br/>
				<span className={"whitespace-nowrap"}>{t("The parsed data will be appended to your tiles wall.")}</span><br/>
				<span className={"font-bold text-green-600"}>{t("This process will not damage existing data.")}</span><br/>
				<br/>
			</>),
			footer: (<>
				<DialogClose asChild>
					<Button variant="secondary" onClick={HandleCancel}>
						{t("Cancel")}
					</Button>
				</DialogClose>
				<DialogClose asChild>
					<Button variant="default" onClick={HandleContinue}>
						{t("Continue")}
					</Button>
				</DialogClose>
			</>),
		},
		"": {}
	}[fileType];

	return (
		<DndFileUiModal
			open={openModal}
			onOpenChange={setOpenModal}
			title={dialogConfig.title}
			description={dialogConfig.description}
			footer={dialogConfig.footer}
		/>
	);
};
