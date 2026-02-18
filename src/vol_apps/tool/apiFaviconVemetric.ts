import {type BlobString, blobToString} from "@/vol_apps/tool/isType";

export const apiFaviconVemetric = async (url: string, size: number): Promise<null | BlobString> => {
		try {
			const domain = new URL(url).hostname;
			const format = "png";
			const response = "image";
			const api_url = `https://favicon.vemetric.com/${domain}?format=${format}&size=${size}&response=${response}`;

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