export const isFontAvailable = (fontFamily: string): boolean => {
	const testString = 'iIl1WMmw0Oo测试中文@#$%&*[]{}<>~';
	const fontSizes = [30, 40, 50];
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) return false;

	const escapedFamily = fontFamily.replace(/"/g, '\\"');
	const fallbackFonts = ['monospace', 'serif', 'sans-serif'];

	for (let f of fallbackFonts) {
		let maxDiff = 0;

		for (let size of fontSizes) {
			ctx.font = `${size}px ${f}`;
			const fallbackWidth = ctx.measureText(testString).width;

			ctx.font = `${size}px "${escapedFamily}", ${f}`;
			const testWidth = ctx.measureText(testString).width;

			const diff = Math.abs(testWidth - fallbackWidth);
			maxDiff = Math.max(maxDiff, diff);
		}

		// 阈值：回退宽度 1%
		if (maxDiff > ctx.measureText(testString).width * 0.01) {
			return true;
		}
	}

	return false;
};