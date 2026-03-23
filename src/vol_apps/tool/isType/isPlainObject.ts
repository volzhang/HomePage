type ValidBase = null | string | number | boolean;
// JsonLikeObject
export type ValidType = ValidBase | Array<ValidType> | { [key: string]: ValidType };
// JsonLikeObject + Blob
export type ValidTypeExt = ValidBase | Blob | Array<ValidTypeExt> | { [key: string]: ValidTypeExt };

// 判断是否为{...}
export const isPlainObject = (value: any): value is Record<string, any> => {
	if (typeof value !== "object" || value === null) return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
};

// 判断是否为数组
const isArray = Array.isArray;

// 核心递归检查函数
const checkValid = (value: any, allowBlob: boolean): boolean => {
	if (
		value === null ||
		typeof value === "boolean" ||
		typeof value === "number" ||
		typeof value === "string" ||
		(allowBlob && value instanceof Blob)
	) {
		return true;
	}

	if (isArray(value)) {
		for (const item of value) {
			if (!checkValid(item, allowBlob)) return false;
		}
		return true;
	}

	if (isPlainObject(value)) {
		for (const key of Object.keys(value)) {
			if (!checkValid(value[key], allowBlob)) return false;
		}
		return true;
	}

	return false;
};

// 判断 ValidType
export const isValidType = (value: any): value is ValidType =>
	checkValid(value, false);

// 判断 ValidTypeExt（允许 Blob）
export const isValidTypeExt = (value: any): value is ValidTypeExt =>
	checkValid(value, true);

// JSON.stringify，缩进可调，同步函数
export const validTypeStringify = (value: any, indent = 4): string =>
	JSON.stringify(value, null, indent);