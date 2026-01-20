import {type ChangeEvent, type ReactElement, useRef} from "react";

export type JsonFile = File & { type: "application/json" };

export const isJsonFile = (file: any): file is JsonFile => {
	return (
		file instanceof File &&
		file.type === "application/json"
	);
};

interface Props {
	onPick?: (file: File) => void;
	children?: ReactElement;
}

export const JsonFilePickerBtn = ({onPick, children}: Props) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const handleClick = () => inputRef.current?.click();
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!isJsonFile(file)) return;
		onPick?.(file);
		e.target.value = "";
	};

	return (
		<>
			<div onClick={handleClick}>
				{children || <button className={"border border-black p-1"}>选择JSON文件</button>}
				<input ref={inputRef} type="file" accept=".json,application/json" onChange={handleChange} hidden/>
			</div>
		</>
	);
};

export const ImgFilePickerBtn = ({onPick, children}: Props) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const handleClick = () => inputRef.current?.click();
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		onPick?.(file as File);
		e.target.value = "";
	};

	return (
		<>
			<div onClick={handleClick}>
				{children || <button className={"border border-black p-1"}>选择图片文件</button>}
				<input ref={inputRef} type="file" accept="image/*" onChange={handleChange} hidden/>
			</div>
		</>
	);
};

export const jsonFilePickerAPI = async (): Promise<JsonFile> => {
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
	if (!isJsonFile(file)) throw new Error("选择的文件不是有效的JSON文件");
	return file;
};