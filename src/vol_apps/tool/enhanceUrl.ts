export function enhanceUrl(input: string): string {
    if (
        input.startsWith('https://')
        || input.startsWith('http://')
        || input.startsWith('ftp://')
    ) {
        return input;
    }
    return `https://${input}`;
}

export function Domain(input: string): string {
    return input.replace(/^https:\/\//, '');
}

export function extractMainDomain(input: string): string {
    const url = new URL(enhanceUrl(input));
    const hostname = url.hostname;
    // 去掉 www. 前缀
    const withoutWww = hostname.replace(/^www\./, '');
    // 分割域名，取倒数第二个部分（主域名）
    const parts = withoutWww.split('.');
    if (parts.length >= 2) {
        return parts[parts.length - 2];
    }
    return withoutWww; // 如果域名太短，直接返回
}

export default enhanceUrl;