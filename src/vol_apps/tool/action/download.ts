import {tryStringify, type ValidType} from "@/vol_apps/tool/isType/isValidType";

export const timeStamp = (): string => {
    return Date.now().toString();
};

export const download = (data_url: string, file_name: string = timeStamp()): void => {
    const a = document.createElement("a");
    a.href = data_url;
    a.download = file_name;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export const downloadBlob = (blob: Blob, file_name: string = timeStamp()): void => {
    const url = URL.createObjectURL(blob);
    try {
        download(url, file_name);
    } finally {
        URL.revokeObjectURL(url);
    }
};

export const downloadTextFile = (
    text: string,
    file_name: string = timeStamp(),
    type: string = "text/plain;charset=utf-8",
): void => {
    const blob = new Blob([text], { type });
    downloadBlob(blob, file_name);
};

export const downloadAsJsonFile = async (
    obj: ValidType,
    file_name = timeStamp(),
): Promise<void> => {
    const jsonContent = tryStringify(obj);
    if (!file_name.endsWith(".json")) file_name += ".json";
    downloadTextFile(jsonContent, file_name, "application/json;charset=utf-8");
};