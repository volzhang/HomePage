export type FloatingDirection = "top" | "bottom" | "left" | "right";
export type FloatingAlign = "start" | "center" | "end";
export type FixedPosition = { top: number, left: number };

export type UseFloatAnimationOptions = {
    open: boolean;
    direction?: FloatingDirection;
    scale?: number;
    duration?: number;
    exitDuration?: number;
    offset?: number;
}
