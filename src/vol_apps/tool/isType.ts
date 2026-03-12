type ValidBase = null | string | number | boolean;
export type ValidType = ValidBase | Array<ValidType> | { [key: string]: ValidType };
export type ValidTypeExt = ValidBase | Blob | Array<ValidTypeExt> | { [key: string]: ValidTypeExt };

export const blobToString = (blob: Blob): Promise<BlobString> => {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as BlobString);
		reader.readAsDataURL(blob);
	});
};

export type BlobString = `data:${string}`

export const isBlobString = (value: any): value is BlobString => {
	return typeof value === "string" && value.startsWith("data:");
};

// export const stringToBlob = async (blobString: string): Promise<Blob> => {
// 	// base64 -> Blob 自动挡
// 	const response = await fetch(blobString);
// 	return await response.blob();
// };

// 判断是否为[...]
const isArray = (value: any): value is Array<any> => {
	return Array.isArray(value);
};

// 判断是否为{...}
export const isPlainObject = (value: any): value is Record<string, any> => {
	if (typeof value !== "object" || value === null) return false;
	if (Object.prototype.toString.call(value) !== "[object Object]") return false;
	const proto = Object.getPrototypeOf(value);
	return proto === null || proto === Object.prototype;
};

// 判断是否为ValidType,如果是，直接JSON.stringify
export const isValidType = (value: any): value is ValidType => {
	if (
		value === null ||
		typeof value === "boolean" ||
		typeof value === "number" ||
		typeof value === "string"
	) {
		return true;
	} else if (isArray(value)) {
		return value.every(item => isValidType(item));
	} else if (isPlainObject(value)) {
		for (const key in value) {
			// if (!isString(key)) return false;
			// for...in 只会遍历可枚举的字符串键，不出现Symbol，所以不检查
			if (isValidType(value[key])) continue;
			return false;
		}
		return true;
	} else {
		return false;
	}
};

export const isValidTypeExt = (value: any): value is ValidTypeExt => {
	if (
		value === null ||
		typeof value === "boolean" ||
		typeof value === "number" ||
		typeof value === "string" ||
		value instanceof Blob
	) {
		return true;
	} else if (isArray(value)) {
		return value.every(item => isValidTypeExt(item));
	} else if (isPlainObject(value)) {
		for (const key in value) {
			if (isValidTypeExt(value[key])) continue;
			return false;
		}
		return true;
	} else {
		return false;
	}
};

export const validTypeStringify = async (value: any): Promise<string> => {
	return JSON.stringify(value, null, 4);  // 2 是缩进，可改成 0 或 4
};

// export const validTypeParse = async (str: string): Promise<any> => {
// 	try {
// 		return JSON.parse(str);
// 	} catch (e) {
// 		throw new Error(`JSON 解析失败: ${e}`);
// 	}
// };

// export const fileToBase64 = (file: File): Promise<string> => {
// 	return new Promise((resolve, reject) => {
// 		const reader = new FileReader();
// 		reader.onload = () => resolve(reader.result as string);
// 		reader.onerror = reject;
// 		reader.readAsDataURL(file);
// 	});
// };
