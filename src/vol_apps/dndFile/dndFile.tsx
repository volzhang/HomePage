import {Button} from "@/components/ui/button";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {useCmStore} from "@/vol_apps/cm/cm_store";
import {handleCmSaveAs} from "@/vol_apps/cm/cm_ui_save_as";
import {getFileExt} from "@/vol_apps/tool/file";
import React, {type JSX, useCallback, useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import {isLikelyTextFile} from "@/vol_apps/tool/isType";

export const DndFile: React.FC = () => {
	const {doc, name, type, setDoc, setName, setType, setIsVisible} = useCmStore();

	const dragCounter = useRef(0);
	const toastId = useRef<string | number | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [open, setOpen] = useState<boolean>(false);

	const [title, setTitle] =  useState<JSX.Element>(<></>);
	const [label, setLabel] = useState<JSX.Element>(<></>);

	const dismissToast = () => {
		if (toastId.current) toast.dismiss(toastId.current);
		toastId.current = null;
	};

	const waitingToast = {
		// message: "等待文件释放到窗口...",
		message: "Drop a file here",
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
			updateOrCreateToast("Not a file", "error");
			return;
		}

		try {
			const _file = item.getAsFile?.();
			if (_file) {
				setFile(_file);
				//开始写逻辑分支
				if (await isLikelyTextFile(_file)) {
					setTitle(
						<>
							File Detected
						</>
					)

					setLabel(
						<>
							Selected: {_file.name}.<br />
							Open in editor?<br />
							Note: The editor content will be replaced.<br />
							Unsaved changes will be lost.
						</>
					);
					setOpen(true);
				}
				dismissToast();
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


	const readInCm =async ()=>{
		if (!file) return;

		const doc = await file.text();
		const name = file.name
		const ext = getFileExt(file.name);

		setDoc(doc);
		setName(name);
		setType(ext);

		setIsVisible(true);
	}

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					{/*<Button variant="outline">Open Dialog</Button>*/}
				</DialogTrigger>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>
							{title}
						</DialogTitle>
						<DialogDescription>
							{label}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant={"default"}
							onClick={
								async ()=> {
									await handleCmSaveAs(doc, name, type);
									setOpen(true); //手动重新打开模态窗口
								}}>
								Export Editor content
							</Button>
						</DialogClose>
						<Button variant={"destructive"} onClick={
							async ()=>{
								await readInCm();
								setOpen(false);
							}
						}>Just Go On</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};