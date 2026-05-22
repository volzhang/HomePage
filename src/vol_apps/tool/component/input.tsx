import {cn} from "@/lib/utils.js"
import {useEffect, useRef, useState} from "react"

const input_css_for_btn_outline = cn(
    "text-center",
    "h-9 px-4 py-2",
    "border bg-background rounded-md ",

    "border-0! ring-0! focus:outline-none",

    "items-center justify-center gap-2",
    "text-sm font-medium ",
    "inline-flex",
    "whitespace-nowrap",

    "hover:bg-accent",
    "hover:text-accent-foreground",

    "dark:bg-input/30",
    "dark:border-input",
    "dark:hover:bg-input/50",

    "shadow-xs",
    "text-foreground",
)

type AutoWidthInputProps = {
    ref?: React.Ref<HTMLInputElement>

    inputValue?: string

    onValueChange?: (v: string) => void
    handleOnClick?: () => void

    inEdit?: boolean

    className?: string
    style?: React.CSSProperties

    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export const AutoWidthInput = ({
                                   ref,

                                   inputValue = "",
                                   onValueChange,
                                   inEdit = false,

                                   handleOnClick,
                                   className,
                                   style,
                                   inputProps,
                               }: AutoWidthInputProps) => {

    const measureRef = useRef<HTMLSpanElement>(null)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        if (measureRef.current) {
            setWidth(measureRef.current.offsetWidth)
        }
    }, [inputValue])

    return (
        <div className={"relative"}>
            <span
                ref={measureRef}
                className={cn(
                    input_css_for_btn_outline,
                    "invisible absolute",
                    className
                )}
            >
                {inputValue}
            </span>

            <input
                {...inputProps}
                ref={ref}
                disabled={!inEdit}
                readOnly={!inEdit}
                value={inputValue}
                onChange={(e) => {
                    onValueChange?.(e.target.value)
                }}
                className={cn(input_css_for_btn_outline, className,)}
                style={{width: `${width}px`, ...style}}
            />
            {/* 透明覆盖层，只接受点击 */}
            {!inEdit && (
                <div
                    onClick={handleOnClick}
                    className={"absolute w-full h-full top-0 left-0 select-none"}
                />
            )}
        </div>

    )
}


