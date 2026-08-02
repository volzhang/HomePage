import {useFloating} from "./useFloating";
import {useMergeRefs} from "@/vol_apps/02_hooks/01_useMergeRefs.ts";
import {useKeyEscapeToClose} from "@/vol_apps/02_hooks/useKeys.ts";
import type {FloatingAnchorType, UseFloatAnimationOptions} from "@/vol_apps/00_types/Types.ts";
import {useClickOutsideToClose} from "@/vol_apps/02_hooks/05_useClickOutsideToClose.ts";
import {useFocusOutsideToClose} from "@/vol_apps/02_hooks/06_useFocusOutsideToClose.ts";

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
    const {focusOutsideRef, focusOutsideIgnoreRef} = useFocusOutsideToClose({open:portalMounted, onClose})
    useKeyEscapeToClose(open, onClose);

    const mergedFloatingRef = useMergeRefs(floatingRef, clickOutsideRef, focusOutsideRef);
    const mergedAnchorRef = useMergeRefs(anchorRef, clickOutsideIgnoreRef, focusOutsideIgnoreRef);

    return {
        anchorRef: mergedAnchorRef,
        floatingRef: mergedFloatingRef,

        floatingPortal,
        floatingStyle,
        portalMounted,
    }
}