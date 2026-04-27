import {cn} from "@/lib/utils";
import {durationClasses, scaleClasses, zIndexClasses} from "@/vol_apps/01_components/Types";

const directionClasses = {
    top: "translate-y-1 origin-top",
    bottom: "-translate-y-1 origin-bottom",
    left: "translate-x-1 origin-left",
    right: "-translate-x-1 origin-right",
    center: "translate-0 origin-center",
} as const;

/**
 * @param open - Controlled open state
 * @param children - The content to render
 * @param zIndex - Stacking order index (default: 1)
 * @param scale - Scale ratio when hidden (default: 95)
 * @param duration - Enter animation duration in ms (default: 200)
 * @param exitDuration - Exit animation duration in ms (default: 0, instant close)
 * @param direction - Direction of the floating animation (default: 'center', no translation)
 * @param className - Additional CSS classes
 */

export const Floating = ({
                             open,
                             children,
                             zIndex = 1,
                             scale = 95,
                             duration = 200,
                             exitDuration = 0,
                             direction = "bottom",
                             className,
                         }: {
    open: boolean;
    zIndex?: keyof typeof zIndexClasses;
    scale?: keyof typeof scaleClasses;
    duration?: keyof typeof durationClasses;
    exitDuration?: keyof typeof durationClasses;
    direction?: keyof typeof directionClasses;
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "transition-all ease-in-out",
                open
                    ? `${durationClasses[duration]} opacity-100 scale-100 translate-x-0 translate-y-0 pointer-events-auto`
                    : `${durationClasses[exitDuration]} opacity-0 ${scaleClasses[scale]} ${directionClasses[direction]} pointer-events-none`,
                zIndexClasses[zIndex],
                className
            )}
        >
            {children}
        </div>
    );
};
