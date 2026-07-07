import {useFloating} from "./useFloating";
import {useMergeRefs} from "@/vol_apps/02_hooks/01_useMergeRefs.ts";
import {useKeyEscapeToClose} from "@/vol_apps/02_hooks/useKeys.ts";
import type {FloatingAnchorType, UseFloatAnimationOptions} from "@/vol_apps/00_types/Types.ts";
import {useClickOutsideToClose} from "@/vol_apps/02_hooks/05_useClickOutsideToClose.ts";

type MyPopoverProps = UseFloatAnimationOptions & {
    align?: FloatingAnchorType;
    zIndex?: number;

    onOpenChange?: (open: boolean) => void;
}

export const usePopover = ({
                               open, onOpenChange,
                               exitDuration,
                               ...otherProps
                           }: MyPopoverProps) => {
    const {anchorRef, floatingRef, floatingStyle, floatingPortal, portalMounted} = useFloating({
        open,
        direction: otherProps.direction,
        align: otherProps.align,
        offset: otherProps.offset,
        duration: otherProps.duration,
        exitDuration,
        scale: otherProps.scale,
        zIndex: otherProps.zIndex,
    });

    const onClose = () => onOpenChange?.(false)

    const {clickOutsideRef, clickOutsideIgnoreRef} = useClickOutsideToClose({open: portalMounted, onClose});
    useKeyEscapeToClose(open, onClose);

    const mergedFloatingRef = useMergeRefs(floatingRef, clickOutsideRef);
    const mergedAnchorRef = useMergeRefs(anchorRef, clickOutsideIgnoreRef);

    return {
        anchorRef: mergedAnchorRef,
        floatingRef: mergedFloatingRef,

        floatingPortal,
        floatingStyle,
        portalMounted,
    }
}