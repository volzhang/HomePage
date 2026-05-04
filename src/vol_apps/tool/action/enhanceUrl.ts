// export function enhanceUrl(input: string): string {
// 	if (
// 		input.startsWith("https://")
// 		|| input.startsWith("http://")
// 		|| input.startsWith("ftp://")
// 		|| input.startsWith("localhost:")
// 		|| isComponentUrl(input)
// 	) {
// 		return input;
// 	}
// 	return `https://${input}`;
// }

export function enhanceUrl(input: string): string {
	// 空输入直接返回空字符串
	if (input === "") {
		return "";
	}

	// 已包含完整协议、localhost 或组件 URL，原样返回
	if (
		input.startsWith("https://") ||
		input.startsWith("http://") ||
		input.startsWith("ftp://") ||
		input.startsWith("localhost:") ||
		input.startsWith("component:")
	) {
		return input;
	}

	//如果用户部分正确，允许用户手动逐步完成
	const targets = [
		"https://",
		"http://",
		"ftp://",
		"localhost:",
		"component:"
	];
	for (const target of targets) {
		if (target.startsWith(input)) {
			return input;
		}
	}

	// 默认补全 https://
	return `https://${input}`;
}

export function extractMainDomain(input: string): string {
	const url = new URL(enhanceUrl(input));
	const hostname = url.hostname;
	// 去掉 www. 前缀
	const withoutWww = hostname.replace(/^www\./, "");
	// 分割域名，取倒数第二个部分（主域名）
	const parts = withoutWww.split(".");
	if (parts.length >= 2) {
		return parts[parts.length - 2];
	}
	return withoutWww;
}