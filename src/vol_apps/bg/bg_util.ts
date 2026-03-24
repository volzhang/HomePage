export const setBackground = (
	base64: string,
	bgSize: string,
	bgRepeat: boolean,
	bgCenter: boolean
) => {

	const html = document.documentElement;
	const body = document.body;

	html.style.backgroundImage = `url("${base64}")`;
	html.style.backgroundSize = bgSize;
	html.style.backgroundRepeat = bgRepeat ? "repeat" : "no-repeat";
	html.style.backgroundPosition = bgCenter ? "center" : "top left";
	html.style.minHeight = "100vh";
	body.style.minHeight = "100vh";
	body.style.margin = "0";
	body.style.padding = "0";
	body.style.background = "transparent";
};