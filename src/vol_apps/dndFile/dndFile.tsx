import {Button} from "@/components/ui/button";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {useCmStore} from "@/vol_apps/cm/cm_store";
import {handleCmSaveAs} from "@/vol_apps/cm/cm_ui_save_as";
import {getFileExt} from "@/vol_apps/tool/phase/file";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import {isLikelyTextFile} from "@/vol_apps/tool/isType/isLikelyTextFile";
import {useTranslation} from "react-i18next";

export const DndFile: React.FC = () => {
	const {t} = useTranslation("dndFile");
	const {doc, name, type, setDoc, setName, setType, setIsVisible} = useCmStore();

	const dragCounter = useRef(0);
	const toastId = useRef<string | number | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [open, setOpen] = useState<boolean>(false);

	const [fileType, setFileType] = useState<"textFile">("textFile");


	const dialogConfig = {
		"textFile": {
			title: t("Detected File:"),
			label: (
				<>
					<span className={"font-bold text-foreground"}>{file?.name}</span><br/>
					{t("Open in editor?")}<br/>
					<br/>
					{t("Editor content will be replaced.")}<br/>
					{t("Unsaved changes will be lost.")}<br/>
					<span className={"font-bold text-[green]"}>{t("Export first to avoid loss.")}</span><br/>
					<br/>
				</>
			)
		},
	}[fileType];


	const dismissToast = () => {
		if (toastId.current) toast.dismiss(toastId.current);
		toastId.current = null;
	};

	const waitingToast = {
		// message: "等待文件释放到窗口...",
		message: t("Drop a file here"),
		data: {duration: Infinity}
	};

	const updateOrCreateToast = (content: string, type: "success" | "error") => {
		const options = {
			id: toastId.current ?? undefined,
			duration: 3000,
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
			updateOrCreateToast(t("Not a file"), "error");
			return;
		}

		try {
			const _file = item.getAsFile?.();
			if (_file) {
				setFile(_file);
				//开始写逻辑分支
				if (await isLikelyTextFile(_file)) {
					setFileType("textFile");
					setOpen(true);
				}
				dismissToast();
			} else {
				updateOrCreateToast(t("Unable to read file"), "error");
			}
		} catch (err) {
			updateOrCreateToast(t("Unable to read file"), "error");
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

	const readInCm = async () => {
		if (!file) return;

		const doc = await file.text();
		const name = file.name;
		const ext = getFileExt(file.name);

		setDoc(doc);
		setName(name);
		setType(ext);

		setIsVisible(true);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					{/*<Button variant="outline">Open Dialog</Button>*/}
				</DialogTrigger>
				<DialogContent className="w-fit">
					<DialogHeader>
						<DialogTitle>
							{dialogConfig["title"]}
						</DialogTitle>
						<DialogDescription>
							{dialogConfig["label"]}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant={"default"}
									onClick={
										async () => {
											await handleCmSaveAs(doc, name, type);
											setOpen(true); //手动重新打开模态窗口
										}}>
								{t("Export Editor content")}
							</Button>
						</DialogClose>
						<Button variant={"destructive"} onClick={
							async () => {
								await readInCm();
								setOpen(false);
							}
						}>{t("Continue")}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};