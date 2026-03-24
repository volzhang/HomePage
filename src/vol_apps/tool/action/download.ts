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