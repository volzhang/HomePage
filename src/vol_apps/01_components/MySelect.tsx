import {cn} from "@/lib/utils";
import {useEffect, useState} from "react";
import {CheckIcon, Languages} from "lucide-react";
import {Floating} from "./Floating";
import {RotateOnOpen} from "@/vol_apps/01_components/RotateOnOpen";
import {useKeyEscapeToClose} from "../02_hooks/useKeyEscapeToClose";
import {useFocusOutsideToClose} from "@/vol_apps/02_hooks/useFocusOutsideToClose";
import {useClickOutsideToClose} from "@/vol_apps/02_hooks/useClickOutsideToClose";
import {useMergeRefs} from "@/vol_apps/02_hooks/useMergeRefs";

const TRIGGER_CLASS = cn(
    "flex items-center justify-between",
    "w-34 h-9 px-3",
    "text-foreground bg-background",
    "rounded-md border shadow-xs text-sm",
    "outline-none select-none",
    "hover:bg-accent hover:text-accent-foreground",
    "dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
);

const MENU_CLASS = cn(
    "absolute p-1",
    "border",
    "bg-popover text-popover-foreground",
    "rounded-md shadow-md",
    "z-1",
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
    options: Option[];
    defaultValue?: string;
    onChange?: (value: string) => void;
}

export const MySelect = ({
                             options,
                             defaultValue,
                             onChange,
                         }: MySelectProps) => {

    // 内部自行管理当前选中的值
    const [selectedValue, setSelectedValue] = useState<string>(
        defaultValue ?? options[0]?.value ?? ""
    );

    const [open, setOpen] = useState(false);

    const focusRef = useFocusOutsideToClose(open, () => setOpen(false));
    const clickRef = useClickOutsideToClose(open, () => setOpen(false));
    const rootRef = useMergeRefs(focusRef, clickRef);

    useKeyEscapeToClose(open, () => setOpen(false));

    useEffect(() => {
        if (defaultValue !== undefined) setSelectedValue(defaultValue);
    }, [defaultValue]);

    const currentLabel =
        options.find((opt) => opt.value === selectedValue)?.label ?? options[0]?.label ?? "";

    const handleSelect = (value: string) => {
        setOpen(false);
        setSelectedValue(value);
        // NOTE: 实测 requestAnimationFrame 无法解决卡顿，保留 setTimeout
        setTimeout(() => onChange?.(value));
    };

    return (
        <div className="relative w-fit animate-fade-in-scale" ref={rootRef}>
            <button
                onClick={() => setOpen(!open)}
                className={cn(TRIGGER_CLASS)}
            >
                <Languages className="size-4 text-foreground"/>
                <span>{currentLabel}</span>
                <RotateOnOpen open={open}/>
            </button>
            <Floating open={open} zIndex={10}>
                <div className={cn(MENU_CLASS, "mt-1")}>
                    <ul className="flex flex-col">
                        {options.map(({label, value}) => (
                            <li key={value}>
                                <button
                                    className={cn(ITEM_CLASS)}
                                    onClick={() => handleSelect(value)}
                                >
                                    {label}
                                    {selectedValue === value
                                        ? <CheckIcon className="size-4"/>
                                        : <span className="size-4"/>
                                    }
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </Floating>

        </div>
    );
};