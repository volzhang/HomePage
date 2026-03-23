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

export const isLikelyTextFile = async (file: File, options: { sampleBytes?: number } = {}): Promise<boolean>  => {
	const SAMPLE_SIZE = options.sampleBytes ?? 8192; // 建议 4–16KB

	if (file.size === 0) return true;           // 空文件算文本
	if (file.size < 16) {
		// 极短文件保守一点
		const buf = await file.slice(0, file.size).arrayBuffer();
		const bytes = new Uint8Array(buf);
		return !bytes.includes(0);                // 极短文件只要没 0 基本是文本
	}

	const chunk = await file.slice(0, Math.min(SAMPLE_SIZE, file.size)).arrayBuffer();
	const bytes = new Uint8Array(chunk);

	// ── 阶段 1：最强硬指标 ── 有 0x00 → 几乎 100% 是二进制
	if (bytes.includes(0)) {
		return false;
	}

	// ── 阶段 2：尝试 UTF-8 解码，看是否合法
	try {
		const decoder = new TextDecoder("utf-8", { fatal: true }); // 改成 fatal: true !
		const text = decoder.decode(bytes);

		// ── 阶段 3：统计可疑控制字符（更严格一点）
		let controlCount = 0;
		for (let i = 0; i < text.length; i++) {
			const code = text.charCodeAt(i);
			if (code < 32 && code !== 9 && code !== 10 && code !== 13 && code !== 27) { // 也把 ESC 排除
				controlCount++;
			}
			// 可选：如果出现大量 DEL (0x7F) 也可以加分怀疑
			// if (code === 0x7F) controlCount += 2;
		}

		const suspiciousRatio = controlCount / text.length;
		if (suspiciousRatio > 0.08) {           // 阈值可调，0.05～0.12 都常见
			return false;
		}

		// 可选加权：如果文件很短但控制字符比例高，也怀疑
		if (text.length < 200 && suspiciousRatio > 0.03) return false;

		return true;

	} catch (e) {
		// 解码失败 → 不是合法 UTF-8 → 大概率二进制
		return false;
	}
}
