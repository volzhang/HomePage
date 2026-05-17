export const formatBytes = (bytes: number | null | undefined): string => {
    const pad = (n: number | null) => {
        if (n === null) return "---";
        return String(n).padStart(3, "0");
    };

    if (bytes == null) {
        return `${pad(null)} M ${pad(null)} K ${pad(null)} B`;
    }
    if (bytes === 0) {
        return `${pad(0)} M ${pad(0)} K ${pad(0)} B`;
    }

    const mb = Math.floor(bytes / (1024 * 1024));
    const remainderAfterMb = bytes % (1024 * 1024);
    const kb = Math.floor(remainderAfterMb / 1024);
    const b = remainderAfterMb % 1024;

    return `${pad(mb)} M ${pad(kb)} K ${pad(b)} B`;
}