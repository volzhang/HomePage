import {Button} from "@/components/ui/button.js"
import {cn} from "@/lib/utils.js"
import {useEffect, useRef, useState} from "react"

const str = randomString()

function randomString(minLen = 1, maxLen = 30) {
    const chars = [
        // 窄字符（小写字母、数字、常见符号）
        ...'abcdefghijklmnopqrstuvwxyz0123456789',
        // 中等宽度（大写字母）
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        // 宽字符（中文、日文等）
        ...'的一是不了在人有中测试文字',
        // 超宽字符（Emoji 占2个字符宽度，但实际渲染会占用更多空间）
        '🔥', '💧', '🚀', '❤️', '🎉', '😊'
    ];

    const length = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
}

export const Btn_outline = () => {
    return (
        <Button variant={"outline"}>
            {str}
        </Button>
    )
}

const input_css_for_btn_outline = cn(
    "text-center",
    "h-9 px-4 py-2",
    "border bg-background rounded-md ",

    "border-0! ring-0! focus:outline-none",

    "items-center justify-center gap-2",
    "text-sm font-medium ",
    "inline-flex",
    "whitespace-nowrap",

    // "transition-all",

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

    // isDisabled?:boolean
    // isReadOnly?:boolean

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


