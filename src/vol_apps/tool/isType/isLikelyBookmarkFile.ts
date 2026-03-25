import {isLikelyTextFile} from "@/vol_apps/tool/isType/isLikelyTextFile";

export const isLikelyBookmarkFile = async (file: File): Promise<boolean> => {
	if (!(await isLikelyTextFile(file))) return false;

	let text: string;
	try {
		text = await file.text();
	} catch {
		return false;
	}

	const head = text.slice(0, 512);

	return (
		head.startsWith('<!DOCTYPE NETSCAPE-Bookmark-file-1>') &&
		head.includes('<H1>Bookmarks</H1>') &&
		head.includes('<DL>')
	);
};

/**
 * Netscape 书签解析器（单文件版）
 *
 * =========================
 * ✅ 关键结构认知（必须理解）
 * =========================
 *
 * 1. <DT> 在源 HTML 中没有闭合标签
 *    👉 浏览器 DOMParser 会在遇到下一个 <DT> 时自动闭合
 *
 * 2. <P> 只是“结构分隔符”
 *    👉 不包含任何书签数据，必须忽略
 *
 * 3. 文件夹（Folder）的唯一可靠判定方式：
 *    👉 <DL> 满足：
 *       - 第一个子元素是 <P>
 *       - 后面紧跟一个兄弟 <P>
 *
 * 4. 子文件夹结构：
 *    👉 <DT><H3>xxx</H3><DL>...</DL>
 *    👉 注意：DL 是 DT 的子元素，不是兄弟
 */ import {defaultIconBase64, type Tile} from "@/vol_apps/tile/tile_store";

// -------------------- 类型 --------------------

type BookmarkItem =
	| { type: "link"; title: string; url: string; icon: string }
	| { type: "folder"; title: string; children: BookmarkItem[]; };

// -------------------- 核心判断 --------------------

/**
 * 判断是否为“合法文件夹 DL”
 */
const isFolderDL = (el: Element): el is HTMLDListElement => {
	return (
		el.tagName === "DL" &&
		el.children[0]?.tagName === "P" &&
		el.nextElementSibling?.tagName === "P"
	);
};

/**
 * 判断 DT 类型（link / folder）
 */
const getDTType = (dt: Element) => {
	const first = dt.children[0];
	if (!first) return null;
	if (first.tagName === "A") return "link";
	if (first.tagName === "H3") return "folder";
	return null;
};

// -------------------- 核心解析 --------------------

const parseFolder = (dl: Element): BookmarkItem[] => {
	const result: BookmarkItem[] = [];

	for (const el of Array.from(dl.children)) {
		// 忽略结构标记
		if (el.tagName === "P") continue;

		if (el.tagName !== "DT") continue;

		const type = getDTType(el);

		// ---------- link ----------
		if (type === "link") {
			const a = el.children[0] as HTMLAnchorElement;

			result.push({
				type: "link",
				title: a.textContent?.trim() || "",
				url: a.getAttribute("href") || "",
				icon: a.getAttribute("icon") || "",
			});
		}

		// ---------- folder ----------
		if (type === "folder") {
			const h3 = el.children[0];
			const title = h3.textContent?.trim() || "";

			// 子 DL 在 DT 内部（关键点）
			const subDL = Array.from(el.children).find(isFolderDL);

			if (subDL) {
				result.push({
					type: "folder",
					title,
					children: parseFolder(subDL),
				});
			}
		}
	}

	return result;
};

// -------------------- 输入适配 --------------------

type BookmarkInput = string | File | Blob;

/**
 * 统一入口（推荐使用）
 * 支持：string / File / Blob
 */
export const netscapeBookmarkFilePhaser = async (
	input: BookmarkInput
): Promise<BookmarkItem[]> => {
	const text = await normalizeToString(input);

	const doc = new DOMParser().parseFromString(text, "text/html");

	const h1 = doc.querySelector("h1")?.textContent?.trim().toLowerCase();

	const rootDL = doc.querySelector("dl");

	if (h1 !== "bookmarks" || !rootDL || !isFolderDL(rootDL)) {
		console.log("Invalid Netscape bookmark file");
		return [];
	}

	return parseFolder(rootDL);
};

/**
 * 输入统一转 string
 */
const normalizeToString = async (input: BookmarkInput): Promise<string> => {
	if (typeof input === "string") {
		return input;
	}

	// File 继承自 Blob，这里统一处理
	if (input instanceof Blob) {
		return await input.text();
	}

	throw new Error("Unsupported input type");
};


export const bookmarksToTiles = (
	input: BookmarkItem[],
): Tile[] => {

	const result: Tile[] = [];

	const walk = (list: BookmarkItem[], path: string[]) => {
		for (const item of list) {

			// ---------- link ----------
			if (item.type === "link") {
				result.push({
					id: result.length,
					url: item.url,
					meta: {
						name: item.title,
						alt: item.title,
						icon: item.icon || defaultIconBase64,
						tags: [...path],
					},
				});
			}

			// ---------- folder ----------
			if (item.type === "folder") {
				walk(item.children, [...path, item.title]);
			}
		}
	};

	walk(input, ["Bookmarks"]);

	return result;
};

export const buildBackupFileFromBookmarks = (tiles: Tile[], filename = "bookmark-import.json"): File => {
	const backupLike = {
		tile: {
			state: {
				tiles,
			},
			version: 0,
		},
	};

	return new File([JSON.stringify(backupLike)], filename, { type: "application/json" });
};