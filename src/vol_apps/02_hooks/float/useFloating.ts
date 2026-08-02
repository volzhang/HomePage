// hooks/useFloating.ts
import {useAnchorPosition} from "./useAnchorPosition";
import type {FloatingAnchorType, UseFloatAnimationOptions} from "@/vol_apps/00_types/Types";
import {useBetterPortal} from "@/vol_apps/02_hooks/float/useBetterPortal.ts";
import {usePureFloatStyles} from "@/vol_apps/02_hooks/float/usePureFloatStyles";
import type {CSSProperties} from "react";
// import {useKeyEscapeToClose} from "@/vol_apps/02_hooks/useKeys.ts";
// import {useClickOutsideToClose} from "@/vol_apps/02_hooks/05_useClickOutsideToClose.ts";
// import {useFocusOutsideToClose} from "@/vol_apps/02_hooks/06_useFocusOutsideToClose.ts";
// import {useMergeRefs} from "@/vol_apps/02_hooks/01_useMergeRefs.ts";

type useFloatingOptions = UseFloatAnimationOptions & {
    align?: FloatingAnchorType;
    zIndex?: number;
    // onOpenChange?: (open: boolean) => void;
}

export function useFloating({
                                open,
                                // onOpenChange,
                                direction = "bottom",
                                align = "start",
                                scale = 95,
                                duration = 200,
                                exitDuration = 200,
                                zIndex = 10,
                                offset = 4,
                            }: useFloatingOptions) {

    const {portal, visible} = useBetterPortal({open, exitDuration})

    const styles = usePureFloatStyles({
        open: visible,
        direction,
        scale,
        duration,
        exitDuration,
        offset,
    })

    const {anchorRef, floatingRef, fixedPosition} = useAnchorPosition({
        open: visible,
        direction,
        anchorType: align,
        offset
    });

    const floatingStyle: CSSProperties = {
        zIndex,
        position: "fixed",
        top: fixedPosition.top,
        left: fixedPosition.left,
        transform: styles.transform,
        opacity: styles.opacity,
        // visibility: anim.visibility,
        // pointerEvents: anim.pointerEvents,
        transition: styles.transition,
        pointerEvents: 'auto'   //需要显式确定为'auto'，否则可能被父组件干扰
    };

    return {anchorRef, floatingRef, floatingStyle, floatingPortal: portal,
        portalMounted: visible};
}


