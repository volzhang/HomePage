import {useEffect, useId, useRef, useState} from "react";
import {cn} from "@/lib/utils";

interface InputButtonProps {
    value?: string;
    onValueChange?: (value: string) => void;
    inEdit?: boolean;
    handleClick?: () => void;
    className?: string;
    styles?: React.CSSProperties;
    inputProps?: React.ComponentProps<"input">;
    ref?: React.Ref<any>;
    checked?: boolean;
}

export const InputButton = ({
                                value,
                                onValueChange,
                                inEdit,
                                handleClick,
                                className,
                                styles,
                                inputProps,
                                ref,
                                checked = false,
                            }: InputButtonProps) => {
    const scope = useId().replace(/:/g, "_");
    const measureRef = useRef<HTMLSpanElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (measureRef.current) {
            setWidth(measureRef.current.offsetWidth);
        }
    }, [value, className, styles]);

    return (
        <>
            <style>{`
                .${scope} {
                    position: relative;
                    display: inline-flex;
                    width: fit-content;
                }

                .${scope} .input-button {
                    width: fit-content;
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                    user-select: none;
                    padding: 2px 8px;
                    background: rgba(0, 0, 0, .16);
                    border-radius: 0;
                    color: rgba(255, 255, 255, .7);
                    transition:
                        color 300ms cubic-bezier(.25, .8, .25, 1),
                        background-color 300ms cubic-bezier(.25, .8, .25, 1),
                        box-shadow 300ms cubic-bezier(.25, .8, .25, 1);
                    display: inline-flex;
                    height: 32px;
                    align-items: center;
                    justify-content: center;
                    min-width: 55px;
                    box-shadow:
                        rgba(0, 0, 0, .15) 0 2px 1px inset,
                        rgba(255, 255, 255, .17) 0 1px 1px;
                    outline: none;
                }

                .${scope} .input-button:hover {
                    background: #2c2c2c;
                    color: white;
                    box-shadow:
                        rgba(0, 0, 0, .23) 0 -4px 1px inset,
                        rgba(255, 255, 255, .17) 0 -1px 1px,
                        rgba(0, 0, 0, .17) 0 2px 4px 1px;
                }

                .${scope}[data-checked="true"] .input-button {
                    background: #2d6737;
                    color: white;
                    box-shadow:
                        rgba(0, 0, 0, .23) 0 -4px 1px inset,
                        rgba(255, 255, 255, .17) 0 -1px 1px,
                        rgba(0, 0, 0, .17) 0 2px 4px 1px;
                }

                .${scope}[data-checked="true"] .input-button:hover {
                    background: #34723f;
                    box-shadow:
                        rgba(0, 0, 0, .26) 0 -4px 1px inset,
                        rgba(255, 255, 255, .17) 0 -1px 1px,
                        rgba(0, 0, 0, .15) 0 3px 6px 2px;
                }

                .${scope} .input-button {
                    transition-property:
                        color,
                        background-color,
                        box-shadow,
                        transform;
                }

                .${scope} .input-button:hover,
                .${scope}[data-checked="true"] .input-button {
                    transform: translateY(-2px);
                }

                .${scope} .click-overlay {
                    z-index: 1;
                }

                .${scope} .input-button {
                    z-index: 0;
                }
            `}</style>

            <div
                className={scope}
                data-checked={checked}
            >
                {/* 内容 + 样式控制宽度 */}
                <span
                    ref={measureRef}
                    className={cn(
                        "absolute invisible",
                        "w-fit h-fit inline-flex text-center whitespace-nowrap",
                        "border-none outline-none",
                        className
                    )}
                    style={styles}
                >
                    {value}
                </span>

                <input
                    ref={ref}
                    type="text"
                    value={value}
                    onChange={e => onValueChange?.(e.target.value)}
                    readOnly={!inEdit}
                    disabled={!inEdit}
                    className={cn(
                        "input-button",
                        "w-fit h-fit inline-flex text-center whitespace-nowrap",
                        "border-none outline-none ring-0 focus:outline-none",
                        className
                    )}
                    style={{
                        width: `${width}px`,
                        ...styles,
                    }}
                    {...inputProps}
                />

                <div
                    onClick={handleClick}
                    className={cn(
                        "click-overlay absolute inset-0 select-none cursor-pointer",
                        inEdit
                            ? "pointer-events-none"
                            : "pointer-events-auto",
                    )}
                />
            </div>
        </>
    );
};