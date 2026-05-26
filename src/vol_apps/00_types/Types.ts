export type FloatingDirection = "top" | "bottom" | "left" | "right";
export type FloatingAnchorType = "start" | "center" | "end";
export type Delta = { top: number, left: number };
export type Size = { width: number, height: number };

export type UseFloatAnimationOptions = {
    open: boolean;
    direction?: FloatingDirection;
    scale?: number;
    duration?: number;
    exitDuration?: number;
    offset?: number;
}
