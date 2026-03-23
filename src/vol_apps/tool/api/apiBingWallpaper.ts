import {type BlobString, blobToString} from "@/vol_apps/tool/a2b/blobToString";

export const apiBingWallpaper = async (index: number, mkt: string
): Promise<{ img: BlobString; copyright: string; } | null> => {
	try {
		const url_img = `https://bing.biturl.top/?resolution=1920&format=image&index=${index}&mkt=${mkt}`;
		const url_copyright = `https://bing.biturl.top/?index=${index}&mkt=${mkt}`;

		const [imgRes, copyrightRes] = await Promise.all([fetch(url_img), fetch(url_copyright),]);
		if (!imgRes.ok || !copyrightRes.ok) return null;
		const blob = await imgRes.blob();
		if (blob.size === 0) return null;
		const data = await copyrightRes.json();
		return {
			img: await blobToString(blob),
			copyright: data.copyright ?? "",
		};
	} catch {
		return null;
	}
};