import {type BlobString, blobToString} from "@/vol_apps/tool/a2b/blobToString";

export const apiFaviconVemetric = async (url: string, size: number): Promise<null | BlobString> => {
		try {
			const domain = new URL(url).hostname;
			// const format = "png";
			// const response = "image";
		// &response=${response}
		// 	format=${format}&
			const api_url = `https://favicon.vemetric.com/${domain}?size=${size}`;

			const resp = await fetch(api_url);
			if (!resp.ok) return null;

			const blob = await resp.blob();
			if (blob.size === 0) return null;

			return await blobToString(blob);
		} catch {
			return null;
		}
	}
;