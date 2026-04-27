import {cn} from "@/lib/utils";
import {durationClasses, opacityClasses} from "@/vol_apps/01_components/Types";

/**
 * @param open - Controls the rotated state
 * @param children - The icon/element to rotate
 * @param opacity - The icon/element opacity (default: 50)
 * @param duration - Rotation animation duration in ms (default: 200)
 * @param className - Additional CSS classes
 */

export const RotateOnOpen = ({
                                 open,
                                 children = <>▼</>,
                                 opacity = 50,
                                 duration = 200,
                                 className,
                             }: {
    open: boolean;
    children?: React.ReactNode;
    opacity?: keyof typeof opacityClasses;
    duration?: keyof typeof durationClasses;
    className?: string;
}) => {
    return (
        <span
            className={cn(
                "inline-block transition-transform text-sm",
                `${durationClasses[duration]}`,
                `${opacityClasses[opacity]}`,
                open && "rotate-180",
                className
            )}
        >
      {children}
    </span>
    );
};