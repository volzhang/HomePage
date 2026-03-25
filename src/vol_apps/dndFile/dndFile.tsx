import {useCmStore} from "@/vol_apps/cm/cm_store";
import {handleCmSaveAs} from "@/vol_apps/cm/cm_ui_save_as";
import {DndFileUiModal} from "@/vol_apps/dndFile/dndFile_ui_modal";
import {useFileDnD} from "@/vol_apps/dndFile/useFileDnD";
import {getFileExt} from "@/vol_apps/tool/action/getFileExt";
import {localforageBackup, localforageRestore} from "@/vol_apps/tool/backupAndRestore";
import {useTranslation} from "react-i18next";
import {DialogClose} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

export const DndFile = () => {
	const {t} = useTranslation("dndFile");
	const {doc, name, type, setDoc, setName, setType, setIsVisible} = useCmStore();
	const {file, openModal, setOpenModal, fileType} = useFileDnD();

	const readInCm = async () => {
		if (!file) return;

		const doc = await file.text();
		const name = file.name;
		const ext = getFileExt(file.name);

		setDoc(doc);
		setName(name);
		setType(ext);

		setOpenModal(false);
		setIsVisible(true);
	};

	const exportEditorContent = async () => {
		await handleCmSaveAs(doc, name, type);
		setOpenModal(true); //导出后，手动重新打开模态窗口
	};

	const DownloadBackup = async () => {
		await localforageBackup();
		setOpenModal(true);
	};

	const ImportBackup = async () => {
		if (!file) return; //理论上不可能
		await localforageRestore(file, false);
		setOpenModal(false);
	}

	const dialogConfig = {
		"textFile": {
			title: (<>{t("Detected File:")}</>),
			description: (<>
				<span className={"font-bold text-foreground"}>{file?.name}</span><br/>
				{t("Open in editor?")}<br/>
				<br/>
				{t("Editor content will be replaced.")}<br/>
				{t("Unsaved changes will be lost.")}<br/>
				<span className={"font-bold text-[green]"}>{t("Export first to avoid loss.")}</span><br/>
				<br/>
			</>),
			footer: (<>
				<DialogClose asChild>
					<Button variant="default" onClick={exportEditorContent}>
						{t("Export Editor content")}
					</Button>
				</DialogClose>
				<Button variant="destructive" onClick={readInCm}>
					{t("Continue")}
				</Button>
			</>),
		},
		"backupFile": {
			title: (<>{t("检测到存档文件:")}</>),
			description: (<>
				<span className={"font-bold text-foreground"}>{file?.name}</span><br/>
				{t("是否应用存档?")}<br/>
				{t("瓷砖设置，会自动去重后添加")}<br/>
				{t("其他设置，会被覆写")}<br/>
				<span className={"font-bold text-[green]"}>{t("建议提前备份存档")}</span><br/>
				<br/>
			</>),
			footer: (<>
				<DialogClose asChild>
					<Button variant="default" onClick={DownloadBackup}>
						{t("下载存档")}
					</Button>
				</DialogClose>
				<Button variant="destructive" onClick={ImportBackup}>
					{t("继续")}
				</Button>
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
