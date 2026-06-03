import {ThrottledColorPicker} from "@/vol_apps/tile/ThrottledColorPickerProps";
import {createDebouncedSet} from "@/vol_apps/03_utils/createDebouncedSet.ts";

export const ColorPickerField = (
    {
        label,
        value,
        onChange,
    }:{
        label:string
        value:string
        onChange:(value:string) => void
    }
) => {
    const setter = createDebouncedSet(onChange, 200)
    return(
        <div className="grid grid-cols-2 w-full items-center">
            <p>{label}</p>
            <ThrottledColorPicker
                className="border w-full items-center"
                value={value}
                onChange={setter}
                delay={100}
            ></ThrottledColorPicker>
        </div>
    )
}