import {type BlobString, blobToString, isBlobString} from "@/vol_apps/tool/isType";

export const apiFaviconVemetric = async (url: string, size: number): Promise<null | BlobString> => {
	const domain = new URL(url).hostname;
	const format = "png";
	const response = "image";
	const api_url = `https://favicon.vemetric.com/${domain}?format=${format}&size=${size}&response=${response}`;

	const resp = await fetch(api_url);
	const blob = await resp.blob();
	const base64 = await blobToString(blob);
	if (isBlobString(base64)) {
		return base64;
	} else {
		return null;
	}
};