// 引入valibot 简化工具函数
import * as v from "valibot";

export type ValidType =
	| null | string | number | boolean
	| Array<ValidType>
	| { [key: string]: ValidType };

const ValidTypeSchema: v.GenericSchema<ValidType> = v.lazy(() =>
	v.union([
		v.null(),
		v.string(),
		v.number(),
		v.boolean(),
		v.array(ValidTypeSchema),
		v.record(v.string(), ValidTypeSchema),
	])
);

// ---------- 类型守卫 ----------
export const isValidType = (value: unknown): value is ValidType =>
	v.is(ValidTypeSchema, value);

// ---------- JSON 序列化 ----------
const validTypeStringify = (value: ValidType, indent = 4): string =>
	JSON.stringify(value, null, indent);

export function tryStringify(value: unknown, indent = 4): string {
	return isValidType(value)
		? validTypeStringify(value, indent)
		: validTypeStringify(null, indent);
}


// type ValidBase = null | string | number | boolean;

// JsonLikeObject
// export type ValidType = ValidBase | Array<ValidType> | { [key: string]: ValidType };
// JsonLikeObject + Blob
// export type ValidTypeExt = ValidBase | Blob | Array<ValidTypeExt> | { [key: string]: ValidTypeExt };

// // 判断是否为数组
// const isArray = Array.isArray;
//
// // 核心递归检查函数
// const checkValid = (value: any, allowBlob: boolean): boolean => {
// 	if (
// 		value === null ||
// 		typeof value === "boolean" ||
// 		typeof value === "number" ||
// 		typeof value === "string" ||
// 		(allowBlob && value instanceof Blob)
// 	) {
// 		return true;
// 	}
//
// 	if (isArray(value)) {
// 		for (const item of value) {
// 			if (!checkValid(item, allowBlob)) return false;
// 		}
// 		return true;
// 	}
//
// 	if (isPlainObject(value)) {
// 		for (const key of Object.keys(value)) {
// 			if (!checkValid(value[key], allowBlob)) return false;
// 		}
// 		return true;
// 	}
//
// 	return false;
// };
//
// // 判断 ValidType
// export const isValidType = (value: any): value is ValidType =>
// 	checkValid(value, false);
//
// // 判断 ValidTypeExt（允许 Blob）
// export const isValidTypeExt = (value: any): value is ValidTypeExt =>
// 	checkValid(value, true);
//
// // JSON.stringify，缩进可调，同步函数
// export const validTypeStringify = (value: any, indent = 4): string =>
// 	JSON.stringify(value, null, indent);