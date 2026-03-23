export const isLikelyTextFile = async (file: File): Promise<boolean> => {
	// ========== 可调参数（集中在此） ==========
	const SAMPLE_SIZE = 8192;              // 采样字节数（4–16KB 均可）
	const CONTROL_RATIO_THRESHOLD = 0.08;  // 控制字符比例上限
	const SHORT_FILE_RATIO_THRESHOLD = 0.03; // 短文件（<200字符）比例上限
	const SHORT_FILE_LENGTH = 200;          // 短文件判定长度

	// 支持的编码（按概率排序）
	const ENCODINGS = [
		'utf-8',
		'windows-1252',
		'iso-8859-1',
		'windows-1251',
		'gb2312',
		'euc-jp',
		'shift-jis',
		'euc-kr',
	];
	// ========================================

	// 空文件直接算文本
	if (file.size === 0) return true;

	// 极短文件：没有空字节就算文本（保守策略）
	if (file.size < 16) {
		const buf = await file.slice(0, file.size).arrayBuffer();
		const bytes = new Uint8Array(buf);
		return !bytes.includes(0);
	}

	// 读取采样数据
	const chunk = await file.slice(0, Math.min(SAMPLE_SIZE, file.size)).arrayBuffer();
	const bytes = new Uint8Array(chunk);

	// 强信号：存在空字节 → 非文本
	if (bytes.includes(0)) return false;

	// 控制字符比例检查
	const isTextLike = (text: string): boolean => {
		let controlCount = 0;
		for (let i = 0; i < text.length; i++) {
			const code = text.charCodeAt(i);
			// 只统计 <32 且不是 \t \n \r \x1B(ESC) 的控制字符
			if (code < 32 && code !== 9 && code !== 10 && code !== 13 && code !== 27) {
				controlCount++;
			}
		}
		const ratio = controlCount / text.length;
		if (ratio > CONTROL_RATIO_THRESHOLD) return false;

		if (text.length < SHORT_FILE_LENGTH && ratio > SHORT_FILE_RATIO_THRESHOLD) return false;
		return true;
	};

	// 依次尝试每种编码解码
	for (const encoding of ENCODINGS) {
		try {
			const decoder = new TextDecoder(encoding, { fatal: true });
			const text = decoder.decode(bytes);
			if (isTextLike(text)) return true;
		} catch {
			// 解码失败，继续尝试下一种编码
		}
	}

	// 所有编码都不符合文本特征
	return false;
};