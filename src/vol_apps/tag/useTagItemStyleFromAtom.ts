import {cn} from "@/lib/utils.ts";
import {useSignal} from "@/vol_apps/04_persist_atoms/signal";
import type {CSSProperties} from "react";
import {tagStyleConfig} from "@/vol_apps/tag/TagStyleAtom.ts";
import {themeConfig} from "@/vol_apps/theme/theme.tsx";

const computeTagItemStyle = (
    checked: boolean,
    theme: "light" | "dark",
    textColor: string,
    textOpacity: number,
    backgroundColor: string,
    backgroundOpacity: number,
    fontSize: number,
    fontWeight: number,
    fontFamily: string,
    textPadding: { x: number; y: number },
    radius: number
) => {
    const textColorStyle = (() => {
        if (textColor === "auto") {
            if (textOpacity === 1.01) return {};
            if (theme === "light") return { color: `rgba(10,10,10, ${textOpacity})` };
            if (theme === "dark") return { color: `rgba(250,250,250, ${textOpacity})` };
        } else {
            const r = parseInt(textColor.slice(1, 3), 16);
            const g = parseInt(textColor.slice(3, 5), 16);
            const b = parseInt(textColor.slice(5, 7), 16);
            return { color: `rgba(${r}, ${g}, ${b}, ${textOpacity})` };
        }
    })();

    const backgroundColorStyle = (() => {
        if (backgroundColor === "auto") {
            if (backgroundOpacity === 1.01) return {};
            if (theme === "light") return { backgroundColor: `rgba(250,250,250, ${backgroundOpacity})` };
            if (theme === "dark") return { backgroundColor: `rgba(10,10,10, ${backgroundOpacity})` };
        } else {
            const r = parseInt(backgroundColor.slice(1, 3), 16);
            const g = parseInt(backgroundColor.slice(3, 5), 16);
            const b = parseInt(backgroundColor.slice(5, 7), 16);
            return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${backgroundOpacity})` };
        }
    })();

    return {
        className: cn(
            "border-none bg-background text-foreground",
            "dark:bg-input/30",
            checked && "bg-sBlue! text-white!"
        ),
        style: {
            fontSize: `${fontSize}px`,
            fontWeight,
            fontFamily,
            padding: `${textPadding.y}px ${textPadding.x}px`,
            borderRadius: `${radius}px`,
            ...textColorStyle,
            ...backgroundColorStyle,
        } satisfies CSSProperties,
    };
};

export const useTagItemStyleFromAtom = (checked: boolean) => {
    const {theme} = useSignal(...themeConfig("theme"))

    const { textColor } = useSignal(...tagStyleConfig("textColor"));
    const { textOpacity } = useSignal(...tagStyleConfig("textOpacity"));
    const { backgroundColor } = useSignal(...tagStyleConfig("backgroundColor"));
    const { backgroundOpacity } = useSignal(...tagStyleConfig("backgroundOpacity"));
    const { fontSize } = useSignal(...tagStyleConfig("fontSize"));
    const { fontWeight } = useSignal(...tagStyleConfig("fontWeight"));
    const { font } = useSignal(...tagStyleConfig("font"));
    const { textPadding } = useSignal(...tagStyleConfig("textPadding"));
    const { radius } = useSignal(...tagStyleConfig("radius"));

    return computeTagItemStyle(
        checked,
        theme as "light" | "dark",
        textColor,
        textOpacity,
        backgroundColor,
        backgroundOpacity,
        fontSize,
        fontWeight,
        font.family,
        textPadding,
        radius
    );
};