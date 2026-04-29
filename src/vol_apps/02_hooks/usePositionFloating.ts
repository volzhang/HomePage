/**
 * @param open - 控制浮层是否打开（由外部管理）
 * @param position - 传入锚点坐标
 * @param scale - 隐藏时缩放百分比，默认 95
 * @param duration - 入场动画时长(ms)，默认 150
 * @param exitDuration - 出场动画时长(ms)，默认 0
 * @param zIndex - 堆叠层级，默认 1
 * @returns `{ floatingStyle }`
 */
export const usePositionFloating = ({
                                        open,
                                        position,
                                        scale = 95,
                                        duration = 150,
                                        exitDuration = 0,
                                        zIndex = 1,
                                    }: {
    open: boolean;
    position: { x: number; y: number };
    scale?: number;
    duration?: number;
    exitDuration?: number;
    zIndex?: number;
}) => {

    const floatingStyle: React.CSSProperties = {
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: zIndex,
        transition: `
            opacity ${open ? duration : exitDuration}ms ease-out,
            transform ${open ? duration : exitDuration}ms ease-out
        `,
        opacity: open ? 1 : 0,
        transformOrigin: "top left",
        transform: open
            ? "translate(0px, 0px) scale(1)"
            : `translate(-5%, -5%) scale(${scale / 100})`,
        pointerEvents: open ? "auto" : "none",
    };
    return {floatingStyle};
};