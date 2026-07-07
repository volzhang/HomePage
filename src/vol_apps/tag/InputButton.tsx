import React, {useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";

interface InputButtonProps {
    value?: string
    onValueChange?: (value: string) => void
    inEdit?: boolean
    handleClick?: () => void
    className?: string
    styles?: React.CSSProperties;
    inputProps?: React.ComponentProps<"input">

    ref?: React.Ref<any>
}

export const InputButton = ({
                                value,
                                onValueChange,
                                inEdit,
                                handleClick,
                                className,
                                styles,
                                inputProps,
                                ref
                            }: InputButtonProps) => {

    const measureRef = useRef<HTMLSpanElement>(null)
    const [width, setWidth] = useState(0)
    useEffect(() => {
        if (measureRef.current) setWidth(measureRef.current.offsetWidth);
    }, [value, className, styles])

    return (
        <>
            <div className={"relative"}>
                {/*内容+样式 控制宽度*/}
                <span className={cn(
                    "absolute invisible",
                    "w-fit h-fit inline-flex text-center whitespace-nowrap",
                    "border-none outline-none",
                    className
                )}
                      style={styles}
                      ref={measureRef}
                >{value}</span>
                <input
                    ref={ref} type="text" value={value}
                    onChange={e => onValueChange?.(e.target.value)}
                    readOnly={!inEdit} disabled={!inEdit}
                    className={cn(
                        "w-fit h-fit inline-flex text-center whitespace-nowrap",
                        "border-none outline-none ring-0 focus:outline-none",
                        className
                    )}
                    style={{
                        width: `${width}px`,
                        ...styles
                    }}
                    {...inputProps}
                />
                <div onClick={handleClick}
                     className={cn(
                         "absolute inset-0 select-none cursor-pointer",
                         inEdit ? "pointer-events-none" : "pointer-events-auto",
                     )}
                ></div>
            </div>
        </>
    )
}
