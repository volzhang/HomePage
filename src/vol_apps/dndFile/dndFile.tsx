import {useCmStore} from "@/vol_apps/cm/cm_store";
import {useDndFileStore} from "@/vol_apps/dndFile/dndFile_store";
import {getFileExt} from "@/vol_apps/tool/file";
import React, {useCallback, useEffect, useRef} from "react";
import {toast} from "sonner";

export const DndFile: React.FC = () => {
	const {setFileHandler} = useDndFileStore();
	const {setDoc, setName, setType, setIsVisible} = useCmStore();

	const dragCounter = useRef(0);
	const toastId = useRef<string | number | null>(null);

	const dismissToast = () => {
		if (toastId.current) toast.dismiss(toastId.current);
		toastId.current = null;
	};

	const waitingToast = {
		// message: "等待文件释放到窗口...",
		message: "Drop file to upload",
		data: {duration: Infinity}
	};

	const updateOrCreateToast = (content: string, type: "success" | "error") => {
		const options = {
			id: toastId.current ?? undefined,
			duration: 3000,
			// style: { color: type === 'success' ? 'green' : 'red' },
		};
		if (type === "success") {
			toastId.current = toast.success(content, options);
		} else {
			toastId.current = toast.error(content, options);
		}
	};

	const handleDragEnter = useCallback((e: DragEvent) => {
		e.preventDefault();
		dragCounter.current++;
		if (dragCounter.current === 1) {
			dismissToast();
			toastId.current = toast.info(waitingToast.message, waitingToast.data);
		}
	}, []);

	const handleDragLeave = useCallback((e: DragEvent) => {
		e.preventDefault();
		dragCounter.current--;
		// 只有真正离开窗口时才关闭 toast
		if (dragCounter.current === 0) {
			dismissToast();
		}
	}, []);

	const handleDrop = useCallback(async (e: DragEvent) => {
		e.preventDefault();
		dragCounter.current = 0;

		const item = e.dataTransfer?.items?.[0];
		if (!item || item.kind !== "file") {
			updateOrCreateToast("Not a file", "error");
			return;
		}

		try {
			const handle = await (item as any).getAsFileSystemHandle?.();
			const file = handle?.kind === "file"
				? await handle.getFile()
				: item.getAsFile();

			if (file) {
				updateOrCreateToast(`Selected: ${file.name}`, "success");
				if (handle?.kind === "file") setFileHandler(handle); // 存储句柄

				const doc = await file.text();
				const name = file.name;
				const ext = getFileExt(file.name);
				if ([".txt", ".md", ".py"].includes(ext)) {
					setDoc(doc);
					setName(name);
					setType(ext);
					setIsVisible(true);
				}

			} else {
				updateOrCreateToast("Unable to read file", "error");
			}
		} catch (err) {
			updateOrCreateToast(`${err instanceof Error ? err.message : "Unknown error"}`, "error");
		}
	}, []);

	const handleDragOver = (e: DragEvent) => e.preventDefault();

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
	}, [handleDragEnter, handleDragLeave, handleDrop]);

	return null;
};