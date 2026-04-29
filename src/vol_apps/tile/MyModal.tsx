import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {X} from "lucide-react";
import {useKeyEscapeToClose} from "../02_hooks/useKeyEscapeToClose";
import {type ReactNode, type RefObject, useEffect, useRef} from "react";

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
                    "fixed inset-0 bg-black/60",
                    "flex items-center justify-center",
                    "transition-opacity duration-250 ease-in-out z-10",
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
                        "flex flex-col",
                        "w-fit h-fit min-w-[700px] min-h-[600px]",
                        "bg-background rounded-md border overflow-hidden",
                        "transition-all duration-250 ease-in-out origin-top z-20",
                        open
                            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                            : "opacity-0 scale-90 -translate-y-2 pointer-events-none"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 顶部区域：关闭按钮 */}
                    <div className="flex justify-end">
                        <Button variant={"link"} size={"icon"}
                                onClick={() => onOpenChange(false)}>
                            <X/>
                        </Button>
                    </div>
                    {/* 中间区域：自动撑满剩余空间 */}
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}