// dndFile.tsx 重构版本
import {useCmStore} from "@/vol_apps/cm/cm_store";
import {DndFileUiModal} from "@/vol_apps/dndFile/dndFile_ui_modal";
import {useFileDnD} from "@/vol_apps/dndFile/useFileDnD";
import {createFileHandlers} from "@/vol_apps/dndFile/fileHandlers";
import {getDialogConfig} from "@/vol_apps/dndFile/dialogConfig";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";

export const DndFile = () => {
	const {t} = useLanguage("dndFile")
	const cmStore = useCmStore();
	const {file, openModal, setOpenModal, fileType} = useFileDnD();

	if (!file) return null;

	const handlers = createFileHandlers(file, cmStore);
	const dialogConfig = getDialogConfig(file, fileType, handlers, t);

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