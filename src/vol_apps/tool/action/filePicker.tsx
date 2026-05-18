import {cn} from "@/lib/utils";
import React, {type ChangeEvent, type ReactElement, useRef, useState} from "react";
import {isLikelyBookmarkFile} from "@/vol_apps/tool/isType/isLikelyBookmarkFile.js";

export const isJsonFile = (file: any) => {
	return (
		file instanceof File &&
		file.type === "application/json"
	);
};

interface Props {
	onPick?: (file: File) => void;
	children?: ReactElement;
	className?: string;
}

export const ImgFilePickerBtn = ({onPick, children, className}: Props) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const handleClick = () => inputRef.current?.click();
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		onPick?.(file as File);
		e.target.value = "";
	};

	//新增：支持拖拽上传图片
	const [isDragging, setIsDragging] = useState(false);
	// --- 新增：拖拽相关事件 ---
	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};
	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};
	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = 'copy'; // 鼠标光标显示「复制」图标
		setIsDragging(true);
	};
	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		// 获取拖拽的文件列表
		const files = Array.from(e.dataTransfer.files);
		// 过滤出图片文件（可根据需要放宽条件）
		const imageFile = files.find(file => file.type.startsWith('image/'));

		if (imageFile) {
			onPick?.(imageFile);
		} else {
			// 可选：提示用户只能拖入图片
			console.warn('请拖入图片文件');
		}
	};

	return (
		<>
			<div
				onClick={handleClick}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				className={cn("flex items-center justify-center", isDragging && "ring ring-blue-500 ring-offset-3 rounded-sm", className)}
			>
				{children || <button className={"border border-black p-1 ring-secondary-foreground w-full"}>选择图片文件</button>}
				<input ref={inputRef} type="file" accept="image/*" onChange={handleChange} hidden/>
			</div>
		</>
	);
};

export const jsonFilePickerAPI = async (): Promise<File> => {
	// @ts-expect-error showOpenFilePicker IDE可能报错，但是没问题
	const [fileHandle] = await window.showOpenFilePicker({
		types: [{
			description: "JSON 文件",
			accept: {"application/json": [".json"]}
		}],
		multiple: false,
		excludeAcceptAllOption: true
	});
	const file = await fileHandle.getFile();
	if (!isJsonFile(file)) console.warn("选择的文件不是有效的JSON文件");
	return file;
};

export const bookmarkFilePickerAPI = async (): Promise<File> =>{
	// @ts-expect-error showOpenFilePicker IDE可能报错，但是没问题
	const [fileHandle] = await window.showOpenFilePicker({
		types: [{
			description: "html 文件",
			accept: {"application/html": [".html"]}
		}],
		multiple: false,
		excludeAcceptAllOption: true
	});
	const file = await fileHandle.getFile();
	if (!await isLikelyBookmarkFile(file)) console.warn("选择的文件不是有效的书签文件");
	return file;
}