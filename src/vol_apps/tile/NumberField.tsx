import {cn} from "@/lib/utils";

type NumberFieldProps = {
    label: string
    value: number
    onChange: (v: number) => void

    min?: number
    max?: number
    step?: number

    fallback?: number   // NaN 时回退
    className?: string
}

export const NumberField = ({
                                label,
                                value,
                                onChange,
                                min,
                                max,
                                step = 1,
                                fallback,
                                className
                            }: NumberFieldProps) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = parseFloat(e.target.value)

        if (isNaN(val)) {
            val = fallback ?? value
        }

        if (min !== undefined) val = Math.max(min, val)
        if (max !== undefined) val = Math.min(max, val)

        onChange(val)
    }

    return (
        <div className={cn("grid grid-cols-2 w-full items-center", className)}>
            <p>{label}</p>
            <input
                type="number"
                value={value}
                step={step}
                min={min}
                max={max}
                className="border pl-1"
                onChange={handleChange}
            />
        </div>
    )
}

type NumberFieldXYProps = {
    label: string

    x: number
    y: number

    onChangeX: (v: number) => void
    onChangeY: (v: number) => void

    min?: number
    max?: number
    step?: number

    fallback?: {x:number, y:number}
}

export const NumberFieldXY = ({
                                  label,
                                  x,
                                  y,
                                  onChangeX,
                                  onChangeY,
                                  min,
                                  max,
                                  step = 1,
                                  fallback = {x:0, y:0}
                              }: NumberFieldXYProps) => {

    const handleX = (v: string, setter: (n: number) => void) => {
        let val = parseFloat(v)

        if (isNaN(val)) val = fallback.x
        if (min !== undefined) val = Math.max(min, val)
        if (max !== undefined) val = Math.min(max, val)

        setter(val)
    }

    const handleY = (v: string, setter: (n: number) => void) => {
        let val = parseFloat(v)

        if (isNaN(val)) val = fallback.y
        if (min !== undefined) val = Math.max(min, val)
        if (max !== undefined) val = Math.min(max, val)

        setter(val)
    }

    return (
        <div className="grid grid-cols-2 w-full items-center">
            <p>{label}</p>
            <div className="flex items-center justify-between">
                <span>x</span>
                <input
                    type="number"
                    value={x}
                    step={step}
                    min={min}
                    max={max}
                    className="border pl-1"
                    onChange={(e) => handleX(e.target.value, onChangeX)}
                />
                <span>y</span>
                <input
                    type="number"
                    value={y}
                    step={step}
                    min={min}
                    max={max}
                    className="border pl-1"
                    onChange={(e) => handleY(e.target.value, onChangeY)}
                />
            </div>
        </div>
    )
}