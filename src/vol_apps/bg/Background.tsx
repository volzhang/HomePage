// import bg0606 from "../bg/imgs/2026-06-06.jpg"
// import bg0604 from "../bg/imgs/2026-06-04.jpg"
// import bg0531 from "../bg/imgs/2026-05-31.jpg"
// import bg0529 from "../bg/imgs/2026-05-29.jpg"
// import bg0524 from "../bg/imgs/2026-05-24.jpg"
// import bg0513 from "../bg/imgs/2026-05-13.jpg"
// import bg0421 from "../bg/imgs/2026-04-21.jpg"
// import bg0410 from "../bg/imgs/2026-04-10.jpg"
import {useCallback, useEffect, useRef, useState} from "react";
import {useBetterPortal} from "@/vol_apps/02_hooks/float/useBetterPortal.ts";

const Background = (props: {
    open: boolean;
    img: string;
    delay: number;
    bgSize: string;
    bgRepeat: boolean;
    bgCenter: boolean;
}) => {
    const { open, img, delay, bgSize, bgRepeat, bgCenter } = props;

    const {portal, visible} = useBetterPortal({open, exitDuration: delay})

    return portal(
        <div style={{
            backgroundImage: `url(${img})`,
            opacity: visible ? 1 : 0,
            transition: `opacity ${delay}ms`,
            willChange: "opacity",

            position: "fixed",
            inset: 0,
            backgroundSize: bgSize,
            backgroundRepeat: bgRepeat ? "repeat" : "no-repeat",
            backgroundPosition: bgCenter ? "center" : "top left",
            zIndex: -999,
            pointerEvents: "none",
        }}>
        </div>
    )
}

interface Layer {
    id: number;
    img: string;
    open: boolean;
}

export const BackgroundSwitcher = (props: {
    bgImg: string;
    delay?: number;
    bgSize: string;
    bgRepeat: boolean;
    bgCenter: boolean;
}) => {
    const {
        bgImg,
        delay = 1500,
        bgSize,
        bgRepeat,
        bgCenter,
    } = props;
    const [layers, setLayers] = useState<Layer[]>([]);
    const idRef = useRef(0);    // 生成唯一ID
    // 清理已关闭层的定时器
    const cleanupTimerRef = useRef<number | null>(null);

    const addLayer = useCallback((newImg: string) => {
        const newId = idRef.current;
        idRef.current = newId + 1;

        setLayers(prev => [
            ...prev.map(l => ({...l,
                open:false,
            })),
            {id: newId, img: newImg, open: true},
        ]);
    }, []);

    useEffect(() => {
        if (bgImg) addLayer(bgImg);
    }, [bgImg, addLayer]);

    // 退出动画结束后，移除 open === false 的层
    useEffect(() => {
        const closedLayers = layers.filter(l => l.open === false)
        if (closedLayers.length > 0) {
            // 等待退出动画完成（最长的 delay）
            cleanupTimerRef.current = window.setTimeout(() => {
                setLayers(prev => prev.filter(l => l.open === true));
            }, 3*delay);
        }
        return () => {
            if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
        };
    }, [layers, delay]);

    return (
        <>
            {layers.map(layer => (
                <Background
                    key={layer.id}
                    open={layer.open}
                    img={layer.img}
                    delay={delay}
                    bgSize={bgSize}
                    bgRepeat={bgRepeat}
                    bgCenter={bgCenter}
                />
            ))}
        </>
    );
};


