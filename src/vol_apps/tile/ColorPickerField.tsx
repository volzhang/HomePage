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
    const setter = createDebouncedSet(onChange, 0)
    return(
        <div className="grid grid-cols-2 w-full items-center">
            <p>{label}</p>
            <input
                type="color"
                className={"border w-full items-center"}
                value={value}
                onChange={(e)=>setter(e.target.value)}
            />
        </div>
    )
}