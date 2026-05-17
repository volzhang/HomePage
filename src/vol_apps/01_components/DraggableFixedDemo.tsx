import { useState } from "react";
import { useDraggablePortal } from "@/vol_apps/02_hooks/UseDraggablePortal";
import {Button} from "@/components/ui/button";
import {useDraggableFixed} from "@/vol_apps/02_hooks/darg/useDraggableFixed";

export const DraggableFixedDemo = () => {
    const [open, setOpen] = useState(false);

    const { Portal} = useDraggablePortal({
        open,
    });

    const {dragging, anchorRef} = useDraggableFixed({
        initialLeft: 0,
        initialTop: 0,
    })

    return (
        <div>
            <Button onClick={() => {
                setOpen(!open)
            }}>
                打开浮窗
            </Button>

            <Portal>
                <div ref={anchorRef} className="bg-red-500 w-30 h-30">
                    {dragging && <span>拖拽中...</span>}
                </div>
            </Portal>
        </div>
    );
};