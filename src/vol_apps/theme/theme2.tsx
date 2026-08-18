import React, {useId} from "react";
import {Moon, Sun} from "lucide-react";
import {cn} from "@/lib/utils.ts";

interface SwitchProps {
    checked: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export const Switch: React.FC<SwitchProps> = ({
                                                  checked,
                                                  onChange,
                                                  disabled = false,
                                                  className = "",
                                                  style,
                                              }) => {
    const scope = useId().replace(/:/g, "_");

    return (
        <>
            <style>{`
                .${scope} {
                    --switch-width: 54px;
                    --switch-height: 36px;
                    --circle-diameter: 30px;
                    --circle-inset:
                        calc((var(--circle-diameter) - var(--switch-height)) / 2);

                    display: inline-block;
                }

                .${scope} input {
                    display: none;
                }

                .${scope} .slider {
                    width: var(--switch-width);
                    height: var(--switch-height);
                    background: var(--background);
                    border: 1px solid var(--border);
                    border-radius: 999px;
                    position: relative;
                    cursor: pointer;
                }

                .dark .${scope} .slider {
                    background: color-mix(
                        in oklab,
                        var(--input) 30%,
                        transparent
                    );
                }

                .${scope} .circle {
                    top: calc((var(--switch-height) - var(--circle-diameter)) / 2 - 1px);
                    left: 2px;

                    width: var(--circle-diameter);
                    height: var(--circle-diameter);

                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 50%;

                    transition:
                        left 150ms cubic-bezier(.4, 0, .2, 1),
                        transform 150ms cubic-bezier(.4, 0, .2, 1);

                    box-shadow:
                        0 2px 1px -1px rgba(0, 0, 0, .2),
                        0 1px 1px rgba(0, 0, 0, .14),
                        0 1px 3px rgba(0, 0, 0, .12);
                }

                .${scope} .circle svg {
                    width: 20px;
                    height: 20px;
                    stroke-width: 2;
                }

                .${scope} .circle::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 255, 255, .75);
                    border-radius: inherit;
                    transition: all 500ms;
                    opacity: 0;
                }

                .${scope} input:checked + .slider .circle {
                    left: calc(100% - var(--circle-diameter) - 2px);
                }

                .${scope} input:active + .slider .circle::before {
                    transition: 0s;
                    opacity: 1;
                    width: 0;
                    height: 0;
                }

                .${scope} input:disabled + .slider {
                    cursor: default;
                    opacity: .6;
                }
            `}</style>

            <label
                className={`${scope} ${className}`}
                style={style}
            >
                <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={e => onChange?.(e.target.checked)}
                />

                <div className="slider">
                    <div
                        className={cn(
                            "circle",
                            "border border-border/20 bg-background shadow-xs",
                            "text-foreground",
                            "hover:bg-accent hover:text-accent-foreground",
                            "dark:bg-input/30 dark:border-border/20",
                            "dark:hover:bg-input/50",
                        )}
                    >
                        {checked ? <Moon/> : <Sun/>}
                    </div>
                </div>
            </label>
        </>
    );
};