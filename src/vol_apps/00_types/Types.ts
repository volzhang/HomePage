export const zIndexClasses = {
    1: "z-1",
    10: "z-10",
    20: "z-20",
    30: "z-30",
    40: "z-40",
    50: "z-50",
} as const;

export const scaleClasses = {
    90: "scale-[0.9]",
    95: "scale-95",
    100: "scale-100",
} as const;

export const durationClasses = {
    0: "duration-0",
    50: "duration-50",
    100: "duration-100",
    200: "duration-200",
    300: "duration-300",
    400: "duration-400",
} as const;

export const opacityClasses = {
    0: "opacity-0",
    30: "opacity-30",
    50: "opacity-50",
    80: "opacity-80",
    100: "opacity-100",
} as const;

export type FloatingDirection = "top" | "bottom" | "left" | "right";
export type FloatingAlign = "start" | "center" | "end";
