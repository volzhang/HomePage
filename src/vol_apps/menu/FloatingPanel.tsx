import {cn} from "@/lib/utils";

export const FloatingPanel = ({
                                  show,
                                  children
                              }: {
    show: boolean;
    children: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "transition-all duration-200 ease-in-out origin-top z-10",
                show
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
            )}
        >
            {children}
        </div>
    );
};