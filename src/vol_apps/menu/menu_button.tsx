import React, {useId} from "react";
import {cn} from "@/lib/utils.ts";

interface SettingButtonProps {
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

export const SettingButton: React.FC<SettingButtonProps> = ({
                                                                onClick,
                                                                className = "",
                                                                style,
                                                                disabled = false,
                                                            }) => {
    const scope = useId().replace(/:/g, "_");

    return (
        <>
            <style>{`
    .${scope} {
        /* ===== 可调整参数 ===== */

        --button-width: 42px;
        --button-height: 36px;
        --button-radius: 10px;

        /* Button Outline */
        --button-bg: transparent;
        --button-border: transparent;

        /* bar / dot */
        --bar-color: var(--foreground);
        --dot-color: var(--background);
        --dot-border: var(--foreground);
        --dot-glow: transparent;

        --bar-width: 56%;
        --bar-height: 1.5px;
        --bar-gap: 6px;

        --dot-size: 2px;
        --dot-border-width: 2px;
        --dot-offset: 4.5px;

        /* ==================== */

        width: var(--button-width);
        height: var(--button-height);

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--bar-gap);

        background: transparent;
        border: 1px solid transparent;
        border-radius: var(--button-radius);

        cursor: pointer;

        transition:
            background-color 150ms ease,
            color 150ms ease;
    }

    /* ===== Dark ===== */



    /* ===== Hover ===== */

    .${scope}:hover {
        background: var(--accent);
        color: var(--accent-foreground);
    }

    .dark .${scope}:hover {
        background: color-mix(
            in oklab,
            var(--input) 50%,
            transparent
        );
    }

    /* ===== Bar ===== */

    .${scope} .bar {
        width: var(--bar-width);
        height: var(--bar-height);

        position: relative;

        display: flex;
        align-items: center;
        justify-content: center;

        background: var(--bar-color);
        border-radius: 2px;
    }

    /* ===== Dot ===== */

    .${scope} .bar::before {
        content: "";

        width: var(--dot-size);
        height: var(--dot-size);

        position: absolute;

        background: var(--dot-color);

        border:
            var(--dot-border-width)
            solid
            var(--dot-border);

        border-radius: 50%;

        box-shadow:
            0 0 5px var(--dot-glow);

        transition:
            transform 300ms ease;
    }

    /* 第一个、第三个圆点 */

    .${scope} .bar1::before {
        transform: translateX(
            calc(var(--dot-offset) * -1)
        );
    }

    /* 中间圆点 */

    .${scope} .bar2::before {
        transform: translateX(
            var(--dot-offset)
        );
    }

    /* ===== Hover ===== */

    .${scope}:hover .bar1::before {
        transform: translateX(
            var(--dot-offset)
        );
    }

    .${scope}:hover .bar2::before {
        transform: translateX(
            calc(var(--dot-offset) * -1)
        );
    }

    /* ===== Disabled ===== */

    .${scope}:disabled {
        cursor: default;
        opacity: .6;
    }
`}</style>

            <button
                type="button"
                className={cn(scope, className)}
                style={style}
                disabled={disabled}
                onClick={onClick}
            >
                <span className="bar bar1"/>
                <span className="bar bar2"/>
                <span className="bar bar1"/>
            </button>
        </>
    );
};