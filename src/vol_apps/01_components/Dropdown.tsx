import {useState} from "react";
import {useFloating} from "../02_hooks/useFloating";
import {usePortal} from "@/vol_apps/02_hooks/usePortal";

export function Dropdown() {
    const [open, setOpen] = useState(false);
    const {anchorRef, floatingStyle, position} = useFloating({open});
    const Portal = usePortal({open, position, exitDuration: 150});

    return (
        <div className={"m-10"}>
            <button ref={anchorRef} onClick={() => setOpen(!open)}>
                打开菜单
            </button>
            <Portal>
                <div style={floatingStyle} className="dropdown-panel">
                    这里是菜单内容
                </div>
            </Portal>
        </div>
    );
}