
import {isLikelyTextFile} from "@/vol_apps/tool/isType/isLikelyTextFile";
import {isPlainObject} from "@/vol_apps/tool/isType/isPlainObject";
import {isValidType} from "@/vol_apps/tool/isType/isValidType";
import {storeHub} from "@/vol_apps/04_persist_atoms";

export const isLikelyBackUpFile = async (file: File): Promise<boolean> => {
	// 1. 必须是文本
	if (!(await isLikelyTextFile(file))) return false;

	let text: string;
	try {
		text = await file.text();
	} catch {
		return false;
	}

	// 2. 必须能 parse 成 JSON
	let data: any;
	try {
		data = JSON.parse(text);
	} catch {
		return false;
	}

	// 3. 必须是 plain object
	if (!isPlainObject(data)) return false;

	// 4. 至少有一个 key（空文件可按需求放开）
	const entries = Object.entries(data);
	if (entries.length === 0) return false;

	// 5. key + value 校验
	for (const [key, value] of entries) {
		// key 必须是已注册 store（核心特征）
		// if (!persistedStores.has(key)) continue;
		if (Object.keys(storeHub.stores).includes(key)) continue;

		// value 必须合法
		if (!isValidType(value)) return false;

		// 命中一个合法 store 就可以判定为 backup
		return true;
	}

	return false;
};