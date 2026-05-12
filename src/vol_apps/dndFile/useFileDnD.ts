import {useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import {useToast} from "./useToast";
import {isLikelyBackUpFile} from "@/vol_apps/tool/isType/isLikelyBackUpFile.js";
import {isLikelyBookmarkFile} from "@/vol_apps/tool/isType/isLikelyBookmarkFile.js";
import {isLikelyTextFile} from "@/vol_apps/tool/isType/isLikelyTextFile.js";
import {useLanguageStore} from "@/vol_apps/language/language_store";

export type FileType = "textFile" | "backupFile" | "bookmarkFile" | "unknown";

export const useFileDnD = () => {
	const {t} = useLanguageStore("dndFile")
	const dragCounter = useRef(0);
	const {toastId, dismissToast, waitingToast, updateOrCreateToast} = useToast();

	const [file, setFile] = useState<File | null>(null);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [fileType, setFileType] = useState<FileType>("unknown");

	const handleDragEnter = (e: DragEvent) => {
		e.preventDefault();
		dragCounter.current++;
		if (dragCounter.current === 1) {
			dismissToast();
			toastId.current = toast.info(waitingToast.message, waitingToast.data);
		}
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		dragCounter.current--;
		// 只有真正离开窗口时才关闭 toast
		if (dragCounter.current === 0) {
			dismissToast();
		}
	};

	const handleDragOver = (e: DragEvent) => e.preventDefault();

	const handleDrop = async (e: DragEvent) => {
		e.preventDefault();
		dragCounter.current = 0;

		const item = e.dataTransfer?.items?.[0];
		if (!item || item.kind !== "file") {
			updateOrCreateToast(t("Not a file"), "error");
			return;
		}

		try {
			const _file = item.getAsFile?.();
			if (_file) {
				setFile(_file);

				// 优先级1，存档文件
				if (await isLikelyBackUpFile(_file)) {
					setFileType("backupFile");
					setOpenModal(true);
				//优先级2，chrome/edge书签文件
				} else if (await isLikelyBookmarkFile(_file)) {
					setFileType("bookmarkFile");
					setOpenModal(true);
				//优先级3，纯文本文件
				} else if (await isLikelyTextFile(_file)) {
					setFileType("textFile");
					setOpenModal(true);
				}


				dismissToast();
			} else {
				updateOrCreateToast(t("Unable to read file"), "error");
			}
		} catch (err) {
			updateOrCreateToast(t("Unable to read file"), "error");
		}
	};

	useEffect(() => {
		window.addEventListener("dragenter", handleDragEnter);
		window.addEventListener("dragover", handleDragOver);
		window.addEventListener("dragleave", handleDragLeave);
		window.addEventListener("drop", handleDrop);
		return () => {
			window.removeEventListener("dragenter", handleDragEnter);
			window.removeEventListener("dragover", handleDragOver);
			window.removeEventListener("dragleave", handleDragLeave);
			window.removeEventListener("drop", handleDrop);
		};
	}, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

	return {
		file,
		fileType,
		openModal,
		setOpenModal,
	};
};