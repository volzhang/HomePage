// hooks/tileStyleHooks.ts
import { useMemo } from "react";
import { tileStyleAtom } from "@/vol_apps/tile/tile_style_atom";

const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const useTileBackgroundColor = () => {
    const { backgroundColor } = tileStyleAtom.useField("backgroundColor");
    const { backgroundOpacity } = tileStyleAtom.useField("backgroundOpacity");
    return useMemo(() => hexToRgba(backgroundColor, backgroundOpacity), [backgroundColor, backgroundOpacity]);
};

export const useTileOutlineColor = () => {
    const { tileOutlineColor } = tileStyleAtom.useField("tileOutlineColor");
    const { tileOutlineOpacity } = tileStyleAtom.useField("tileOutlineOpacity");
    return useMemo(() => hexToRgba(tileOutlineColor, tileOutlineOpacity), [tileOutlineColor, tileOutlineOpacity]);
};

export const useTileTextColor = () => {
    const { textColor } = tileStyleAtom.useField("textColor");
    const { textOpacity } = tileStyleAtom.useField("textOpacity");
    return useMemo(() => hexToRgba(textColor, textOpacity), [textColor, textOpacity]);
};

export const useTileStyleChanged = () => {
    return tileStyleAtom.atomChanged(); // 假设 atomChanged 是一个 hook，返回 boolean
};

export const useResetTileStyle = () => {
    return () => tileStyleAtom.reset(); // reset 是函数，可以直接返回，不需要订阅
};