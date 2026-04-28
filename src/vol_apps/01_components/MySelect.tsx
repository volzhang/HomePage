import {cn} from "@/lib/utils";
import {useKeyEscapeToClose} from "../02_hooks/useKeyEscapeToClose";
import {useFocusOutsideToClose} from "@/vol_apps/02_hooks/useFocusOutsideToClose";
import {useClickOutsideToClose} from "@/vol_apps/02_hooks/useClickOutsideToClose";
import {useMergeRefs} from "@/vol_apps/02_hooks/useMergeRefs";
import {useFloating} from "../02_hooks/useFloating";
import {Ulist} from "@/vol_apps/01_components/Ulist";

const MENU_CLASS = cn(
    "flex flex-col items-center border py-1 w-34",
    "bg-popover text-popover-foreground",
    "rounded-md shadow-md",
    "select-none",
);

const ITEM_CLASS = cn(
    "flex items-center justify-between",
    "px-2 h-8 min-w-32 bg-background",
    "text-sm rounded-sm",
    "hover:bg-foreground/5",
    "whitespace-nowrap",
    "select-none"
);

export interface Option {
    label: string;
    value: string;
}

export interface MySelectProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    value: string;
    onValueChange: (value: string) => void;

    options: Option[];
    trigger: React.ReactNode;
}

export const MySelect = ({
                             open,
                             onOpenChange,

                             value,
                             onValueChange,

                             options,
                             trigger
                         }: MySelectProps) => {

    const focusRef = useFocusOutsideToClose(open, () => onOpenChange(false));
    const clickRef = useClickOutsideToClose(open, () => onOpenChange(false));

    const {anchorRef, floatingStyle} = useFloating({open, direction: "bottom"});
    const rootRef = useMergeRefs(focusRef, clickRef,)
    useKeyEscapeToClose(open, () => onOpenChange(false));

    const handleSelect = (value: string) => {
        onOpenChange(false)
        // NOTE: 实测 requestAnimationFrame 无法解决卡顿，保留 setTimeout
        setTimeout(() => onValueChange(value));
    };


    return (
        <div ref={rootRef}>
            <div className={"w-fit h-fit animate-fade-in-scale"} ref={anchorRef}>
                {trigger}
            </div>
            <div style={floatingStyle}>
                <Ulist value={value} options={options} handleSelect={handleSelect}
                       menu_className={MENU_CLASS}
                       item_className={ITEM_CLASS}
                       checkIcon_className={"size-4"}
                />
            </div>
        </div>

    );
};