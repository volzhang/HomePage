import {refreshAtoms} from "@/vol_apps/atomStorage/atomStorage";
import {download, timeStamp} from "@/vol_apps/tool/download";
import type {JsonFile} from "@/vol_apps/tool/filePicker";
import {isPlainObject, isValidTypeExt, type ValidTypeExt, validTypeParse, validTypeStringify} from "@/vol_apps/tool/isType";
import localforage from "localforage";

export const downloadAsJsonFile = async (
	obj: ValidTypeExt,
	file_name = timeStamp(),
): Promise<void> => {
	const jsonContent = await validTypeStringify(obj);
	const blob = new Blob([jsonContent], {
		type: "application/json;charset=utf-8",
	});
	if (!file_name.endsWith(".json")) file_name += ".json";
	const url = URL.createObjectURL(blob);
	try {
		download(url, file_name);
	} finally {
		URL.revokeObjectURL(url);
	}
};

export const localforageRestore = async (file: JsonFile, clearFirst: boolean = false): Promise<void> => {
	const text = await file.text();
	const obj = await validTypeParse(text);
	if (isPlainObject(obj)) {
		if (clearFirst) await localforage.clear();
		await Promise.all(Array.from(Object.entries(obj), ([k, v]) => localforage.setItem(k, v)));
	}
	await refreshAtoms();//这里必须手动刷新，不然不会自动刷新，即使atom和localforage已经成功换值
};

export const localforageBackup = async (): Promise<void> => {
	const result: Record<string, any> = {};
	await localforage.iterate((value, key) => {
		if (isValidTypeExt(value)) {
			result[key] = value;
		}
	});
	await downloadAsJsonFile(result, `DB-${timeStamp()}.json`);
};