import { useBetterPortal } from "./useBetterPortal";
import { usePureFloatStyles } from "./usePureFloatStyles";
import type {ReactNode} from "react";

interface UseCenteredFloatingOptions {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    zIndex?: number;
    duration?: number;
    exitDuration?: number;
    scale?: number;
}

export function useModalPortal({
                                        open,
                                        onOpenChange,
                                        zIndex = 1000,
                                        duration = 200,
                                        exitDuration = 150,
                                        scale = 95,
                                    }: UseCenteredFloatingOptions) {

    const { portal, visible } = useBetterPortal({ open, exitDuration });

    const anim = usePureFloatStyles({
        open: visible,
        direction: "bottom",
        scale,
        duration,
        exitDuration,
        offset: 0,
    });

    const handleBackdropClick = () => {
        onOpenChange?.(false);
    };

    // 整合固定定位、背景、居中、动画
    const modalPortal = (node: ReactNode) =>
        portal(
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex,
                    backgroundColor: "rgba(0, 0, 0, 0.5)", // bg-black/50
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    // 外层容器只做透明度淡入淡出，背景和内容一起淡入淡出
                    opacity: anim.opacity,
                    transition: anim.transition,
                }}
                onClick={handleBackdropClick}
            >
                {/* 内层容器负责缩放（scale），不影响背景 */}
                <div
                    style={{
                        transform: anim.transform,
                        transition: anim.transition,
                        transformOrigin: "center center",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {node}
                </div>
            </div>
        );

    return { modalPortal };
}