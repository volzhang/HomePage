import {useState} from "react";
import {usePositionFloating} from "../02_hooks/usePositionFloating";

export const Demo = () => {
    const [open, setOpen] = useState(false)
    const [position, setPosition] = useState({x: 0, y: 0})
    const {floatingStyle} = usePositionFloating({open, position})

    return (
        <div className={"flex border"}>
            <div onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setPosition({x: e.clientX, y: e.clientY})
                setOpen(true)
            }}
                 className={"w-100 h-100 border m-10"}>
            </div>
            <div style={floatingStyle} onClick={() => setOpen(false)}
                 className={"w-40 h-40 border bg-red-400"}>
            </div>
        </div>

    )
}