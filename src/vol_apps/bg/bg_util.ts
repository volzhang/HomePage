import {get} from "idb-keyval";
import {img} from "@/vol_apps/bg/bg_atom.ts";

let layerA: HTMLDivElement;
let layerB: HTMLDivElement;

let current = "a";

export const bgInitState = {
    bgImg: img,
    bgSize: "auto",
    bgRepeat: true,
    bgCenter: false,
}

// waitForDoubleFrame 替代 void next.offsetHeight;
const waitForDoubleFrame = () => {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });
}

export const initBgLayer = async () => {
    const data = await get("bg");

    if (data !== undefined) {
        const state = data.state;
        if (state !== undefined) {
            if (state?.bgImg) bgInitState.bgImg = state.bgImg;
            if (state?.bgSize !== undefined) bgInitState.bgSize = state.bgSize;
            if (state?.bgRepeat !== undefined) bgInitState.bgRepeat = state.bgRepeat;
            if (state?.bgCenter !== undefined) bgInitState.bgCenter = state.bgCenter;
        }
    }

    // 预加载 + 解码
    const preloadImg = new Image();
    await new Promise<void>((resolve) => {
        preloadImg.onload = async () => {
            try { await preloadImg.decode(); } catch {}
            resolve();
        };
        preloadImg.onerror = () => resolve();
        preloadImg.src = bgInitState.bgImg;
    });

    try {
        const bitmap = await createImageBitmap(preloadImg);
        bitmap.close();
    } catch {}

    // 建层，先透明
    layerA = document.createElement("div");
    layerB = document.createElement("div");
    layerA.id = "bg-layer-a";
    layerB.id = "bg-layer-b";

    const baseStyle = `
        position: fixed;
        inset: 0;
        background-image: url(${bgInitState.bgImg});
        background-size: ${bgInitState.bgSize};
        background-position: ${bgInitState.bgCenter ? "center" : "top left"};
        background-repeat: ${bgInitState.bgRepeat ? "repeat" : "no-repeat"};
        transition: opacity 200ms;
        will-change: opacity;
        z-index: -999;
        pointer-events: none;
        opacity: 0;
    `;
    layerA.style.cssText = baseStyle;
    layerB.style.cssText = baseStyle;

    document.body.appendChild(layerB);
    document.body.appendChild(layerA);

    await waitForDoubleFrame();
    layerA.style.opacity = "1";
    await waitForDoubleFrame();
    layerA.style.transition = "opacity 1000m"
    layerB.style.transition = "opacity 1000m"

};

// export const initBgLayer = async () => {
//     // 1. 从 IndexedDB 恢复上次的状态
//
//     // const data = await get("bg", createStore("localforage", "keyvaluepairs"));
//     // 新signal框架直接使用默认数据库
//     const data = await get("bg")
//
//     if (data !== undefined) {
//         // const date = JSON.parse(data);
//         // 新signal框架不需要解析，因为直接保存的对象
//         const state = data.state;
//         if (state !== undefined) {
//             if (state?.bgImg) bgInitState.bgImg = state.bgImg;
//             if (state?.bgSize  !== undefined) bgInitState.bgSize  = state.bgSize;
//             if (state?.bgRepeat !== undefined) bgInitState.bgRepeat = state.bgRepeat;
//             if (state?.bgCenter !== undefined) bgInitState.bgCenter = state.bgCenter;
//         }
//     }
//
//     // 2. 预加载背景图，确保整张图解码完成
//     await new Promise<void>((resolve) => {
//         const preloadImg = new Image();
//         preloadImg.onload = async () => {
//             try {
//                 await preloadImg.decode();
//             } catch {}
//             resolve();
//         };
//         preloadImg.onerror = () => resolve();
//         preloadImg.src = bgInitState.bgImg;
//     });
//
//     await waitForDoubleFrame()
//
//     // 3. 图片完全就绪，创建图层并插入 DOM
//     layerA = document.createElement("div");
//     layerB = document.createElement("div");
//     layerA.id = "bg-layer-a";
//     layerB.id = "bg-layer-b";
//
//     const baseStyle = `
//     position: fixed;
//     inset: 0;
//     background-image: url(${bgInitState.bgImg});
//     background-size: ${bgInitState.bgSize};
//     background-position: ${bgInitState.bgCenter ? "center" : "top left"};
//     background-repeat: ${bgInitState.bgRepeat ? "repeat" : "no-repeat"};
//     transition: opacity 1s;
//     will-change: opacity;
//     z-index: -999;
//     pointer-events: none;
//   `;
//     layerA.style.cssText = baseStyle + "opacity:1;";
//     layerB.style.cssText = baseStyle + "opacity:0;";
//     document.body.appendChild(layerB);
//     document.body.appendChild(layerA);
// };

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


