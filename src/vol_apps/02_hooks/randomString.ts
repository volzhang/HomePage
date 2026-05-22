export const randomString = (minLen = 1, maxLen = 30) => {
    const chars = [
        // 窄字符（小写字母、数字、常见符号）
        ...'abcdefghijklmnopqrstuvwxyz0123456789',
        // 中等宽度（大写字母）
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        // 宽字符（中文、日文等）
        ...'的一是不了在人有中测试文字',
        // 超宽字符（Emoji 占2个字符宽度，但实际渲染会占用更多空间）
        '🔥', '💧', '🚀', '❤️', '🎉', '😊'
    ];

    const length = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
}