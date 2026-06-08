// backgroundManager.tsx
import { useEffect, useState } from "react";
// import {createStore, get} from "idb-keyval";
import {BackgroundSwitcher} from "@/vol_apps/bg/Background.tsx";

/* ========== 1. 创建原生层 & 自动加载默认背景 ========== */
// const initDiv = document.createElement("div");
// initDiv.id = "initial-bg";
// initDiv.style.cssText = `
//   position: fixed;
//   inset: 0;
//   background-size: contain;
//   background-position: "auto";
//   background-repeat: no-repeat;
//   z-index: -999;
//   opacity: 1;
// `;
//
// // will-change: opacity;
// // transition: opacity 1s ease-in-out;
// document.body.appendChild(initDiv);
//
// // 异步获取默认背景
// get("bg", createStore("localforage", "keyvaluepairs")).then((data: any) => {
//     data = JSON.parse(data);
//     console.log("data", data);
//     const bgImg = data.state.bgImg;
//     initDiv.style.backgroundImage = `url("${bgImg}")`;
//     initDiv.style.backgroundSize = "cover";       // 默认值，可自定义
//     initDiv.style.backgroundRepeat = "no-repeat"; // 默认值
//     initDiv.style.backgroundPosition = "center";  // 默认值
// });

/* ========== 2. 命令式 API ========== */
let reactReady = false;
let reactUpdate: ((img: string, size: string, repeat: boolean, center: boolean) => void) | null = null;

export const setBackground = (
    base64: string,
    bgSize: string,
    bgRepeat: boolean,
    bgCenter: boolean
) => {
    if (!reactReady) {
    //     initDiv.style.backgroundImage = `url("${base64}")`;
    //     initDiv.style.backgroundSize = bgSize;
    //     initDiv.style.backgroundRepeat = bgRepeat ? "repeat" : "no-repeat";
    //     initDiv.style.backgroundPosition = bgCenter ? "center" : "top left";
    //     initDiv.style.opacity = "1";
    } else {
        reactUpdate?.(base64, bgSize, bgRepeat, bgCenter);
    }
};

/* ========== 3. React 接管组件 ========== */
export const BackgroundManager = () => {
    const [img, setImg] = useState("");
    const [size, setSize] = useState("cover");
    const [repeat, setRepeat] = useState(false);
    const [center, setCenter] = useState(true);

    useEffect(() => {
        // 注册 React 更新函数
        reactUpdate = (newImg, newSize, newRepeat, newCenter) => {
            setImg(newImg);
            setSize(newSize);
            setRepeat(newRepeat);
            setCenter(newCenter);
        };

        reactReady = true;

        // 隐藏原生层（带淡出）
        // initDiv.style.opacity = "0";
        // const onTransitionEnd = () => {
        //     initDiv.style.display = "none";
        //     initDiv.removeEventListener("transitionend", onTransitionEnd);
        // };
        // initDiv.addEventListener("transitionend", onTransitionEnd);
        // const timer = setTimeout(() => {
        //     initDiv.style.display = "none";
        //     initDiv.removeEventListener("transitionend", onTransitionEnd);
        // }, 1500); // 与 transition 时长一致

        return () => {
            // clearTimeout(timer);
            // initDiv.removeEventListener("transitionend", onTransitionEnd);
            reactReady = false;
            reactUpdate = null;
        };
    }, []);

    return (
        <BackgroundSwitcher
            bgImg={img}
            bgSize={size}
            bgRepeat={repeat}
            bgCenter={center}
            delay={1500}
        />
    );
};