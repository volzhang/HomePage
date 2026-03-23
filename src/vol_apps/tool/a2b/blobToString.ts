export type BlobString = `data:${string}`;

export const isBlobString = (value: unknown): value is BlobString =>
	typeof value === "string" && value.startsWith("data:");

export const blobToString = (blob: Blob): Promise<BlobString> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const result = reader.result;
			if (isBlobString(result)) {
				resolve(result);
			} else {
				reject(new Error("Failed to convert Blob to BlobString"));
			}
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});

export const stringToBlob = async (blobString: string): Promise<Blob> => {
	// base64 -> Blob 自动挡
	const response = await fetch(blobString);
	return await response.blob();
};