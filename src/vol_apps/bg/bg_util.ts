let initialized = false;

let layerA: HTMLDivElement;
let layerB: HTMLDivElement;

let current = "a";

function initBgLayer() {
	if (initialized) return;

	layerA = document.createElement("div");
	layerB = document.createElement("div");

	layerA.id = "bg-layer-a";
	layerB.id = "bg-layer-b";

	const baseStyle = `
		position: fixed;
		inset: 0;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		transition: opacity 1s ease-in-out;
		will-change: opacity;
		z-index: -999;
		pointer-events: none;
	`;

	layerA.style.cssText = baseStyle + "opacity:1;";
	layerB.style.cssText = baseStyle + "opacity:0;";

	document.body.appendChild(layerA);
	document.body.appendChild(layerB);

	initialized = true;
}

export const setBackground = (
	base64: string,
	bgSize: string,
	bgRepeat: boolean,
	bgCenter: boolean
) => {
	initBgLayer();

	const next = current === "a" ? layerB : layerA;
	void next.offsetHeight;
	const prev = current === "a" ? layerA : layerB;
	void prev.offsetHeight;

	// 设置新样式
	next.style.backgroundImage = `url("${base64}")`;
	void next.offsetHeight;
	next.style.backgroundSize = bgSize;
	void next.offsetHeight;
	next.style.backgroundRepeat = bgRepeat ? "repeat" : "no-repeat";
	void next.offsetHeight;
	next.style.backgroundPosition = bgCenter ? "center" : "top left";
	void next.offsetHeight;

	// 触发交叉淡化
	next.style.opacity = "1";
	void next.offsetHeight;

	prev.style.opacity = "0";
	void prev.offsetHeight;

	current = current === "a" ? "b" : "a";
};

