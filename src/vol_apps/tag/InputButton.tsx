import {useLayoutEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";

export const InputButton = (
    {
        value,
        onValueChange,

        inEdit,
        handleClick,

        className,
        inputProps,
    }:{
        value?:string,
        onValueChange?:(value:string) => void,

        inEdit?: boolean,
        handleClick?:()=>void,

        className?:string
        inputProps?: React.ComponentProps<'input'>
    }
) => {

    const measureRef = useRef<HTMLSpanElement>(null)

    const [width, setWidth] = useState(0)

    useLayoutEffect(() => {
        if (!measureRef.current) return
        const rect = measureRef.current.getBoundingClientRect()
        setWidth(rect.width)
    },[value])

    return (
        <>
            <div className={"relative flex items-center justify-center"}>
                {/*内容+样式 控制宽度*/}
                <span className={cn(
                    "invisible",
                    "w-fit h-fit",
                    "m-0 border-none outline-none text-center",
                    className
                )}
                    ref={measureRef}
                    >{value}</span>
                <input
                    type ="text"
                    value={value}
                    onChange={e => onValueChange?.(e.target.value)}
                    readOnly={!inEdit}
                    disabled={!inEdit}
                    className={cn(
                        "absolute inset-0 select-none whitespace-nowrap",
                        "p-0 m-0 border-none outline-none text-center",
                        "transition-[width]",
                        inEdit ? "duration-10" : "duration-100",
                        className
                        )}
                    style={{
                        width: `${width}px`,
                    }}
                    {...inputProps}
                />
                <div onClick={handleClick}
                     className={cn(
                         "absolute inset-0 select-none",
                         inEdit ? "pointer-events-none" : "pointer-events-auto",
                     )}
                ></div>
            </div>

        </>
    )
}