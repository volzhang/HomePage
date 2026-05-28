import {ThrottledColorPicker} from "@/vol_apps/tile/ThrottledColorPickerProps";

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
    return(
        <div className="grid grid-cols-2 w-full items-center">
            <p>{label}</p>
            <ThrottledColorPicker
                className="border w-full items-center"
                value={value}
                onChange={onChange}
                delay={100}
            ></ThrottledColorPicker>
        </div>
    )
}