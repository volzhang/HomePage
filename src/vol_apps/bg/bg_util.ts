import {addBootstrapTask} from "@/vol_apps/bootstrap/bootstrap.ts";
import {createStore, get} from "idb-keyval";
import {img} from "@/vol_apps/bg/bg_store.ts";

// Note: 初始化背景，使用原生JS，不能用react

let initialized = false;

let layerA: HTMLDivElement;
let layerB: HTMLDivElement;

let current = "a";

export const bgInitState = {
    bgImg:img,
    bgSize:"auto",
    bgRepeat:true,
    bgCenter:false,
}

// waitForDoubleFrame 替代 void next.offsetHeight;
const waitForDoubleFrame = () => {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });
}

const initBgLayer = async () => {
    if (initialized) return;

    layerA = document.createElement("div");
    layerB = document.createElement("div");

    layerA.id = "bg-layer-a";
    layerB.id = "bg-layer-b";

    const data = await get("bg", createStore("localforage","keyvaluepairs"))

    if (data !== undefined) {
        const date = JSON.parse(data)
        const state = date.state
        bgInitState.bgImg = state?.bgImg
        bgInitState.bgSize = state?.bgImgSize
        bgInitState.bgRepeat = state?.bgImgRepeat
        bgInitState.bgCenter = state?.bgImgCenter
    }

    const bgImg = bgInitState.bgImg ?? img;
    const bgSize = bgInitState.bgSize ?? "auto"
    const bgRepeat = bgInitState.bgRepeat ?? "true"
    const bgCenter = bgInitState.bgCenter ?? "false"

    const baseStyle = `
		position: fixed;
		inset: 0;
		background-image: url(${bgImg});
		background-size: ${bgSize};
		background-position: ${bgCenter ? "center" : "top left"};
		background-repeat: ${bgRepeat ? "repeat" : "no-repeat"};
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

addBootstrapTask(()=>initBgLayer())

export const setBackground = async (
    base64: string,
    bgSize: string,
    bgRepeat: boolean,
    bgCenter: boolean
) => {

    const next = current === "a" ? layerB : layerA;
    const prev = current === "a" ? layerA : layerB;

    // 设置新样式
    next.style.backgroundImage = `url("${base64}")`;
    next.style.backgroundSize = bgSize;
    next.style.backgroundRepeat = bgRepeat ? "repeat" : "no-repeat";
    next.style.backgroundPosition = bgCenter ? "center" : "top left";
    await waitForDoubleFrame();

    // 触发交叉淡化
    next.style.opacity = "1";
    await waitForDoubleFrame();
    prev.style.opacity = "0";

    current = current === "a" ? "b" : "a";
};


