// ValidType可以直接JSON.stringify
// ValidTypeExt 需要处理额外类型的序列化(Blob <-> String)

type ValidBase = null | string | number | boolean;
export type ValidType = ValidBase | Array<ValidType> | { [key: string]: ValidType };
export type ValidTypeExt = ValidBase | Blob | Array<ValidTypeExt> | { [key: string]: ValidTypeExt };

const blobToString = (blob: Blob): Promise<string> => {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.readAsDataURL(blob);
	});
};

type BlobString = `data:${string}`

const isBlobString = (value: any): value is BlobString => {
	return typeof value === "string" && value.startsWith("data:");
};

// const stringToBlob_manual = async (blobString: string): Promise<Blob> => {
// 	// base64 -> Blob 手动挡 备用
// 	const index = blobString.indexOf(",");
// 	const header = blobString.slice(5, index);
// 	const base64 = blobString.slice(index + 1);
// 	const mime = header.split(";")[0] || "application/octet-stream";
// 	const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
// 	return new Blob([binary], {type: mime});
// };

const stringToBlob = async (blobString: string): Promise<Blob> => {
	// base64 -> Blob 自动挡
	const response = await fetch(blobString);
	return await response.blob();
};

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

export const validTypeStringify = async (value: ValidTypeExt): Promise<string> => {
	const blobMap = new WeakMap<Blob, string>();
	const replaceBlobWithPlaceholder = async (val: any): Promise<any> => {
		if (val instanceof Blob) {
			if (blobMap.has(val)) return blobMap.get(val);
			const dataUrl = await blobToString(val);
			blobMap.set(val, dataUrl);
			return dataUrl;
		}
		if (isArray(val)) return await Promise.all(val.map(item => replaceBlobWithPlaceholder(item)));
		if (isPlainObject(val)) {
			const result: Record<string, any> = {};
			for (const key in val) {
				if (Object.prototype.hasOwnProperty.call(val, key)) {
					result[key] = await replaceBlobWithPlaceholder(val[key]);
				}
			}
			return result;
		}
		return val;
	};
	const processedValue = await replaceBlobWithPlaceholder(value);
	return JSON.stringify(processedValue, null, 4);
};

export const validTypeParse = async (str: string): Promise<ValidTypeExt> => {
	let parsed: any;
	try {
		parsed = JSON.parse(str);
	} catch (e) {
		throw new Error("Invalid JSON string");
	}
	const restoreBlob = async (val: any): Promise<any> => {
		if (isBlobString(val)) return await stringToBlob(val);
		if (Array.isArray(val)) {
			return Promise.all(val.map(item => restoreBlob(item)));
		}
		if (isPlainObject(val)) {
			const result: Record<string, any> = {};
			for (const key in val) {
				if (Object.prototype.hasOwnProperty.call(val, key)) result[key] = await restoreBlob(val[key]);
			}
			return result;
		}
		return val;
	};
	return await restoreBlob(parsed);
};


export const fileToBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
};




