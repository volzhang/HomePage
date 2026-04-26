import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type HalfDrawerProps = {
    isOpen: boolean;
    preview: ReactNode;
    panel: ReactNode;
    className?: string;
};

// 简洁稳定版 HalfDrawer
export const HalfDrawer = ({
                               isOpen,
                               preview,
                               panel,
                               className,
                           }: HalfDrawerProps) => {
    return (
        <div
            className={cn(
                "grid w-full h-full overflow-hidden",
                "transition-all duration-300 ease-in-out",
                className
            )}
            style={{gridTemplateColumns: "1fr 1fr",}}
        >
            {/* 左侧 preview */}
            <div
                className={cn(
                    "flex items-center justify-center relative",
                    "transition-all duration-300 ease-in-out",
                    isOpen
                        ? "translate-x-0 w-full"
                        : "translate-x w-[200%]",
                )}
            >
                {preview}
            </div>

            {/* 右侧 panel */}
            <div
                className={cn(
                    "relative h-full overflow-hidden",
                    "transition-opacity duration-300 ease-in-out",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
            >
                {/* 可滚动内容层 */}
                <div
                    className={cn(
                        "h-full w-full overflow-y-auto",
                        "transition-transform duration-300 ease-in-out",
                        isOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    {panel}
                </div>
            </div>
        </div>
    );
};