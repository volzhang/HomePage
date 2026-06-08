// hooks/tileStyleHooks.ts
import { useMemo } from "react";
import {tileStyleConfig} from "@/vol_apps/tile/tile_style_atom";
import {useSignal} from "@/vol_apps/04_persist_atoms";

const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const useTileBackgroundColor = () => {
    const { backgroundColor } = useSignal(...tileStyleConfig("backgroundColor"))
    const { backgroundOpacity } = useSignal(...tileStyleConfig("backgroundOpacity"))

    return useMemo(() => hexToRgba(backgroundColor, backgroundOpacity), [backgroundColor, backgroundOpacity]);
};

export const useTileOutlineColor = () => {
    const { tileOutlineColor } = useSignal(...tileStyleConfig("tileOutlineColor"))
    const { tileOutlineOpacity } = useSignal(...tileStyleConfig("tileOutlineOpacity"))

    return useMemo(() => hexToRgba(tileOutlineColor, tileOutlineOpacity), [tileOutlineColor, tileOutlineOpacity]);
};

export const useTileTextColor = () => {
    const { textColor } = useSignal(...tileStyleConfig("textColor"))
    const { textOpacity } = useSignal(...tileStyleConfig("textOpacity"))

    return useMemo(() => hexToRgba(textColor, textOpacity), [textColor, textOpacity]);
};

// export const useTileStyleChanged = () => {
//     return tileStyleAtom.atomChanged(); // 假设 atomChanged 是一个 hook，返回 boolean
// };
//
// export const useResetTileStyle = () => {
//     return () => tileStyleAtom.reset(); // reset 是函数，可以直接返回，不需要订阅
// };