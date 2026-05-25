import {cn} from "@/lib/utils";
import {useKeyEscapeToClose} from "../02_hooks/useKeys";
import {type ReactNode, type RefObject, useEffect, useRef} from "react";
import {useFloatStyles} from "@/vol_apps/02_hooks/float/useFloatStyles";

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    children?: ReactNode

    closeOnOverlayClick?: boolean
    initialFocusRef?: RefObject<HTMLElement | null>
    okRef?: RefObject<HTMLElement | null>
}

export const MyModal = ({
                            open,
                            onOpenChange,
                            children,
                            closeOnOverlayClick = true,
                            initialFocusRef,
                            okRef,
                        }: Props) => {

    const modalContentRef = useRef<HTMLDivElement>(null);

    const floatingStyle = useFloatStyles({
        open, direction: "bottom", offset: 32,
        duration: 300, exitDuration:300
    })

    useKeyEscapeToClose(open, () => onOpenChange(false));

    useEffect(() => {
        if (!open) return;
        const id = requestAnimationFrame(() => {
            const target = initialFocusRef?.current ?? modalContentRef.current;
            target?.focus();
        });
        return () => cancelAnimationFrame(id);
    }, [open, initialFocusRef]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                const target = okRef?.current ?? modalContentRef.current;
                target?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, okRef]);

    return (
        <>
            {/* 遮罩层 z-10 */}
            <div
                className={cn(
                    // "relative",
                    "fixed inset-0 bg-black/60",
                    "flex items-center justify-center",
                    "transition-opacity duration-300 ease-in-out z-10",
                    open
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                )}
                onClick={() => closeOnOverlayClick && onOpenChange(false)}
            >
                {/* 菜单层 z-20 */}
                <div
                    ref={modalContentRef}
                    tabIndex={-1}
                    className={cn(
                        // "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ",
                        "flex flex-col z-20",
                        "w-fit h-fit min-w-[700px]",
                        "bg-background rounded-md border",
                        "max-h-[98vh] overflow-y-auto",
                    )}
                    style={floatingStyle}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 中间区域：自动撑满剩余空间 */}
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}