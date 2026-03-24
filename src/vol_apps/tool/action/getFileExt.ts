export const getFileExt = (name: string): string => {
	const i = name.lastIndexOf(".");
	return i === -1 ? "" : name.slice(i);
};