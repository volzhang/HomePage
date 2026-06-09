import {createStore, get} from "idb-keyval";
import {img} from "@/vol_apps/bg/bg_store.ts";

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
// const waitForDoubleFrame = () => {
//     return new Promise(resolve => {
//         requestAnimationFrame(() => {
//             requestAnimationFrame(resolve);
//         });
//     });
// }

export const initBgLayer = async () => {
    layerA = document.createElement("div");
    layerB = document.createElement("div");

    layerA.id = "bg-layer-a";
    layerB.id = "bg-layer-b";

    const data = await get("bg", createStore("localforage","keyvaluepairs"))
    if (data !== undefined) {
        const date = JSON.parse(data)
        const state = date.state
        if (state !== undefined) {
            bgInitState.bgImg = state?.bgImg
            bgInitState.bgSize = state?.bgSize
            bgInitState.bgRepeat = state?.bgRepeat
            bgInitState.bgCenter = state?.bgCenter
        }
    }

    const baseStyle = `
		position: fixed;
		inset: 0;

        background-image: url(${bgInitState.bgImg});
        background-size: ${bgInitState.bgSize};
        background-position: ${bgInitState.bgCenter ? "center" : "top left"};
        background-repeat: ${bgInitState.bgRepeat ? "repeat" : "no-repeat"};

		transition: opacity 1s;
		will-change: opacity;
		z-index: -999;
		pointer-events: none;
	`;

    layerA.style.cssText = baseStyle + "opacity:1;";
    layerB.style.cssText = baseStyle + "opacity:0;";
    document.body.appendChild(layerB);
    document.body.appendChild(layerA);

}

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
    next.style.backgroundPosition = bgCenter ? "center" : "top left";
    next.style.backgroundRepeat = bgRepeat ? "repeat" : "no-repeat";
    // void next.offsetHeight;

    // 触发交叉淡化
    next.style.opacity = "1";
    // void next.offsetHeight;

    prev.style.opacity = "0";

    current = current === "a" ? "b" : "a";
};


